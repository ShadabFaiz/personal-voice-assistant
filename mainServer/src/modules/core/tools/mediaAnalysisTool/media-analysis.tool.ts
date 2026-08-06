import { HumanMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { tool } from '@langchain/core/tools';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { z } from 'zod';
import {
  LLMProvider,
  LLMProviderInitResult,
} from '../../../llm/types/llm-provider.types';
import { AppConfig } from '../../config/configuration';
import { DEFAULT_AGENT_WORKSPACE_DIRECTORY_NAME } from '../../config/constants';
import { AppDataDirectoryService } from '../../services/appDirectory.service';
import {
  buildCacheHitTextPrompt,
  buildVisionExtractionPrompt,
} from './constants';
import { toolDescription } from './description';

@Injectable()
export class MediaAnalysisTool {
  private readonly logger = new Logger(MediaAnalysisTool.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly configService: ConfigService<AppConfig>,
    private readonly appDataDirectoryService: AppDataDirectoryService,
  ) {}

  private async getVisionModel() {
    // Lazily resolve from the global NestJS application context (avoids circular dependency since it lives in LLMModule)
    const visionProvider = this.moduleRef.get<LLMProvider>(
      'VISION_LLM_PROVIDER',
      { strict: false },
    );
    const result: LLMProviderInitResult = await visionProvider.initialize();
    return result.model;
  }

  private resolveSecurePaths(relativePath: string): {
    workspaceRoot: string;
    absolutePath: string;
  } {
    const workspaceRoot = path.resolve(
      this.appDataDirectoryService.getAppDataPath(),
      this.configService.get<string>(
        'AGENT_WORKSPACE_DIRECTORY_NAME',
        DEFAULT_AGENT_WORKSPACE_DIRECTORY_NAME,
      ),
    );

    let relativeStr = relativePath;
    if (relativeStr.startsWith('/')) relativeStr = relativeStr.slice(1);
    const absolutePath = path.resolve(workspaceRoot, relativeStr);

    if (!absolutePath.startsWith(workspaceRoot)) {
      throw new Error(`Access outside workspace denied: ${absolutePath}`);
    }

    return { workspaceRoot, absolutePath };
  }

  private async resolveCachePath(
    workspaceRoot: string,
    fileBuffer: Buffer,
  ): Promise<{ hash: string; cachePath: string }> {
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const cacheDir = path.join(workspaceRoot, '.cache', 'media_analysis');
    await fs.mkdir(cacheDir, { recursive: true });

    return {
      hash,
      cachePath: path.join(cacheDir, `${hash}.extraction.json`),
    };
  }

  private resolveMimeType(originalPath: string): string {
    const ext = path.extname(originalPath).toLowerCase().slice(1);
    let mimeType = 'application/octet-stream';
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    } else if (ext === 'pdf') {
      mimeType = 'application/pdf';
    } else if (['mp4', 'webm'].includes(ext)) {
      mimeType = `video/${ext}`;
    } else if (['mp3', 'ogg', 'wav', 'webm'].includes(ext)) {
      mimeType = `audio/${ext}`;
    }
    return mimeType;
  }

  private async executeCacheHit(
    chatModel: BaseChatModel,
    fileName: string,
    cachedText: string,
    query: string,
  ): Promise<string> {
    this.logger.log(`cache hit for file: ${fileName}. Using extracted data`);
    const response = await chatModel.invoke([
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: buildCacheHitTextPrompt(cachedText, query),
          },
        ],
      }),
    ]);
    return response.content as string;
  }

  private async executeCacheMiss(
    chatModel: BaseChatModel,
    cachePath: string,
    fileBuffer: Buffer,
    fileName: string,
    originalPath: string,
    query: string,
  ): Promise<string> {
    this.logger.log(
      `cache missed for file: ${fileName}. Sending data to vision llm`,
    );

    const base64Str = fileBuffer.toString('base64');
    const mimeType = this.resolveMimeType(originalPath);

    const prompt = buildVisionExtractionPrompt(query);

    // Multi-modal LangChain invocation schema
    const response = await chatModel.invoke([
      new HumanMessage({
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Str}` },
          },
        ],
      }),
    ]);

    const content = response.content as string;
    let resultAnswer = content;

    try {
      const cleanJson = content
        .replace(/\\`\\`\\`json/gi, '')
        .replace(/\\`\\`\\`/g, '')
        .trim();
      const data = JSON.parse(cleanJson);

      if (data.extracted_data) {
        await fs.writeFile(
          cachePath,
          JSON.stringify({ extracted_data: data.extracted_data }),
        );
        this.logger.debug(
          `Successfully cached media extraction to ${cachePath}`,
        );
      }
      if (data.answer) resultAnswer = data.answer;
    } catch (e) {
      this.logger.warn(`Failed to parse structured JSON from Vision LLM: ${e}`);
    }

    return resultAnswer;
  }

  async execute(params: { path: string; query: string }): Promise<string> {
    try {
      const { workspaceRoot, absolutePath } = this.resolveSecurePaths(
        params.path,
      );

      this.logger.debug(`Analyzing media physically at ${absolutePath}`);

      const fileBuffer = await fs.readFile(absolutePath);
      const chatModel = await this.getVisionModel();
      const fileName = path.basename(absolutePath);
      const { cachePath } = await this.resolveCachePath(
        workspaceRoot,
        fileBuffer,
      );

      let cachedText: string = '';
      try {
        const cacheData = await fs.readFile(cachePath, 'utf8');
        const parsedData = JSON.parse(cacheData) as { extracted_data: string };
        cachedText = parsedData.extracted_data;
      } catch (err) {
        this.logger.debug(
          `Cache missed for file: ${fileName}: ${JSON.stringify(err, null, 2)}`,
        );
        return await this.executeCacheMiss(
          chatModel,
          cachePath,
          fileBuffer,
          fileName,
          params.path,
          params.query,
        );
      }

      if (cachedText) {
        return await this.executeCacheHit(
          chatModel,
          fileName,
          cachedText,
          params.query,
        );
      }

      return await this.executeCacheMiss(
        chatModel,
        cachePath,
        fileBuffer,
        fileName,
        params.path,
        params.query,
      );
    } catch (error) {
      const errStr = error instanceof Error ? error.message : String(error);
      this.logger.error(`Media analysis failed: ${errStr}`);
      return `Error analyzing media. The tool failed to execute: ${errStr}`;
    }
  }

  getAllTools() {
    return [
      tool((params) => this.execute(params), {
        name: 'analyze_media',
        description: toolDescription,
        schema: z.object({
          path: z
            .string()
            .describe(
              'The exact absolute file path to the local media exactly as it was provided to you in the prompt.',
            ),
          query: z
            .string()
            .describe(
              'Detailed instruction for what the vision model should look for or extract from the media (e.g. "Read this PDF and summarize the total sum").',
            ),
        }),
      }),
    ];
  }
}

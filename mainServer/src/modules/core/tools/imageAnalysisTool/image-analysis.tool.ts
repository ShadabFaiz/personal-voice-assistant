import { tool } from '@langchain/core/tools';
import { HumanMessage } from '@langchain/core/messages';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { z } from 'zod';
import { ModuleRef } from '@nestjs/core';
import { LLMProviderInitResult, LLMProvider } from '../../../llm/types/llm-provider.types';
import { ConfigService } from '@nestjs/config';
import { AppDataDirectoryService } from '../../services/appDirectory.service';
import { AppConfig } from '../../config/configuration';
import { toolDescription } from './description';

@Injectable()
export class ImageAnalysisTool {
  private readonly logger = new Logger(ImageAnalysisTool.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly configService: ConfigService<AppConfig>,
    private readonly appDataDirectoryService: AppDataDirectoryService
  ) {}

  private async getVisionModel() {
    // Lazily resolve from the global NestJS application context (avoids circular dependency since it lives in LLMModule)
    const visionProvider = this.moduleRef.get<LLMProvider>('VISION_LLM_PROVIDER', { strict: false });
    const result: LLMProviderInitResult = await visionProvider.initialize();
    return result.model;
  }

  async execute(params: { path: string; query: string }): Promise<string> {
    try {
      // The LLM treats paths as relative to the sandboxed agent_workspace. 
      // We must map it natively to the host absolute path.
      const workspaceRoot = path.resolve(
        this.appDataDirectoryService.getAppDataPath(),
        this.configService.get<string>('AGENT_WORKSPACE_DIRECTORY_NAME') as string
      );
      
      // Safeguard against path traversal or improper resolution
      let relativeStr = params.path;
      if (relativeStr.startsWith('/')) relativeStr = relativeStr.slice(1);
      const absolutePath = path.resolve(workspaceRoot, relativeStr);

      if (!absolutePath.startsWith(workspaceRoot)) {
         throw new Error(`Access outside workspace denied: ${absolutePath}`);
      }

      this.logger.debug(`Analyzing image physically at ${absolutePath}`);
      
      const fileBuffer = await fs.readFile(absolutePath);
      const base64Str = fileBuffer.toString('base64');
      const ext = path.extname(params.path).toLowerCase().slice(1);
      const mimeType = ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : 'image/jpeg';
      
      const chatModel = await this.getVisionModel();
      
      // Multi-modal LangChain invocation schema
      const response = await chatModel.invoke([
        new HumanMessage({
          content: [
            { type: 'text', text: params.query },
            { 
              type: 'image_url', 
              image_url: { url: `data:${mimeType};base64,${base64Str}` } 
            }
          ]
        })
      ]);
      
      return response.content as string;
    } catch (error) {
      const errStr = error instanceof Error ? error.message : String(error);
      this.logger.error(`Image analysis failed: ${errStr}`);
      return `Error analyzing image. The tool failed to execute: ${errStr}`;
    }
  }

  getAllTools() {
    return [
      tool((params) => this.execute(params), {
        name: 'analyze_image',
        description: toolDescription,
        schema: z.object({
          path: z.string().describe('The path to the local image file relative to the agent_workspace/ root folder (exactly as it was provided to you in the prompt).'),
          query: z.string().describe('Detailed instruction for what the vision model should look for or extract from the image (e.g. "Read this receipt and return the total price").')
        }),
      })
    ];
  }
}

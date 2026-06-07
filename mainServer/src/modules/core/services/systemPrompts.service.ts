import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import path from 'node:path';
import { PromptFile } from './interface';

const PERSONALITY_FALLBACK =
  'You are a helpful AI assistant. designed to help humans.';

@Injectable()
export class SystemPromptsService {
  private readonly logger = new Logger(SystemPromptsService.name);

  constructor(private readonly configService: ConfigService) {}

  loadAllSystemPrompts(): string {
    this.logger.debug(' ***** Loading system prompts ***** ');

    const rootDir = this.resolvePromptsDirectory();
    const rootPromptFiles = this.loadPromptFilesFromDirectory(rootDir);
    const personalityPrompt = this.loadPersonalityPrompt();

    const contexts = this.buildContexts(rootPromptFiles, personalityPrompt);

    this.logger.debug(' ***** System prompts loaded ***** ');

    return this.createXML(contexts);
  }

  private resolvePromptsDirectory(): string {
    const promptsDir = this.configService.get<string>(
      'SYSTEM_PROMPTS_DIRECTORY',
      '',
    );
    return path.join(process.cwd(), promptsDir);
  }

  private loadPromptFilesFromDirectory(directory: string): PromptFile[] {
    try {
      const entries = fs.readdirSync(directory, { withFileTypes: true });
      const promptFiles = entries
        .filter(
          (entry) => entry.isFile() && path.extname(entry.name) === '.txt',
        )
        .map((entry) => this.readPromptFile(directory, entry.name));

      this.logger.debug(
        `Loaded ${promptFiles.length} prompt file(s) from: ${directory}`,
      );
      return promptFiles;
    } catch (error) {
      this.logger.error(`Failed to read prompt directory: ${directory}`, error);
      return [];
    }
  }

  private readPromptFile(directory: string, fileName: string): PromptFile {
    const filePath = path.join(directory, fileName);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const name = path.basename(fileName, '.txt');
      this.logger.debug(`Prompt loaded from file: ${filePath}`);
      return { name, content };
    } catch (error) {
      this.logger.error(`Failed to load prompt from file: ${filePath}`, error);
      return { name: path.basename(fileName, '.txt'), content: '' };
    }
  }

  private loadPersonalityPrompt(): string {
    const promptsDir = this.configService.get<string>(
      'SYSTEM_PROMPTS_DIRECTORY',
      '',
    );
    const personalityDir = this.configService.get<string>(
      'AGENT_PERSONALITIES_DIRECTORY',
      '',
    );
    const personalityFile = this.configService.get<string>(
      'AGENT_PERSONALITY',
      '',
    );

    const filePath = path.join(
      process.cwd(),
      promptsDir,
      personalityDir,
      personalityFile,
    );

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.logger.debug(`Agent Personality loaded from file: ${filePath}`);
      return content;
    } catch (error) {
      this.logger.error(
        `Failed to load agent Personality from file: ${filePath}`,
        error,
      );
      this.logger.log(
        `Using default value for agent personality: ${PERSONALITY_FALLBACK}`,
      );
      return PERSONALITY_FALLBACK;
    }
  }

  private buildContexts(
    rootPromptFiles: PromptFile[],
    personalityPrompt: string,
  ): Record<string, unknown> {
    const promptSections: Record<string, string> = {};

    for (const file of rootPromptFiles) {
      const key = this.toSnakeCase(file.name);
      promptSections[key] = file.content;
    }

    return {
      system_context: {
        ...promptSections,
        persona_instructions: personalityPrompt,
      },
    };
  }

  private toSnakeCase(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s.-]+/g, '_')
      .toLowerCase();
  }

  private createXML(tags: Record<string, unknown>): string {
    let xmlString = '';
    function processTags(tags: Record<string, unknown>) {
      for (const [tag, content] of Object.entries(tags)) {
        if (typeof content === 'object' && content !== null) {
          xmlString += `<${tag}>`;
          processTags(content as Record<string, unknown>);
          xmlString += `</${tag}>`;
        } else {
          xmlString += `<${tag}>${content as string}</${tag}>`;
        }
      }
    }

    processTags(tags);

    return xmlString;
  }
}

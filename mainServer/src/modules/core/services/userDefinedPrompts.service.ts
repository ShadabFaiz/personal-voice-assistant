import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import path from 'node:path';
import { FileTool } from '../tools/fileTool/file.tool';
import { FileOperation } from '../tools/fileTool/file-tool.types';
import { USER_DEFINED_PROMPTS_DIRECTORY } from './userDefinedPrompts.constants';

@Injectable()
export class UserDefinedPromptsService implements OnModuleInit {
  private readonly logger = new Logger(UserDefinedPromptsService.name);

  constructor(private readonly fileTool: FileTool) {}

  async onModuleInit() {
    const directory = USER_DEFINED_PROMPTS_DIRECTORY;
    this.logger.debug(`Checking if directory exists: ${directory}`);

    const [listError] = await this.fileTool.execute({
      operation: FileOperation.LIST,
      path: directory,
    });

    if (listError) {
      this.logger.log(`Directory ${directory} does not exist. Creating it...`);
      // Since FileTool implicitly creates parent directories, we create and delete a temporary file
      const dummyFilePath = `${USER_DEFINED_PROMPTS_DIRECTORY}init.txt`;
      const [createError] = await this.fileTool.execute({
        operation: FileOperation.CREATE,
        path: dummyFilePath,
        content: 'init',
      });

      if (!createError) {
        await this.fileTool.execute({
          operation: FileOperation.DELETE,
          path: dummyFilePath,
        });
        this.logger.log(`Directory ${directory} successfully created.`);
      } else {
        this.logger.error(`Failed to create directory ${directory}`, createError.message);
      }
    }
  }


  async loadAllUserDefinedPrompts(): Promise<string> {
    this.logger.debug(' ***** Loading user defined prompts ***** ');

    const promptFiles = await this.loadPromptFilesFromWorkspace();

    const contexts = this.buildContexts(promptFiles);

    this.logger.debug(' ***** User defined prompts loaded ***** ');

    return this.createXML(contexts);
  }

  private async loadPromptFilesFromWorkspace(): Promise<{ name: string; content: string }[]> {
    const directory = USER_DEFINED_PROMPTS_DIRECTORY;

    this.logger.debug(`Fetching list of files from: ${directory}`);
    const [listError, listData] = await this.fileTool.execute({
      operation: FileOperation.LIST,
      path: directory,
    });

    if (listError) {
      if (listError.message && listError.message.toLowerCase().includes('does not exist')) {
        this.logger.debug(`User defined prompts directory does not exist, skipping: ${directory}`);
      } else {
        this.logger.warn(`Failed to list directory: ${directory}. Error: ${listError.message}`);
      }
      return [];
    }

    const paths = listData?.paths || [];
    const promptFiles: { name: string; content: string }[] = [];

    for (const filePath of paths) {
      if (!filePath.endsWith('.txt') && !filePath.endsWith('.md')) {
        continue;
      }

      this.logger.debug(`Reading prompt file: ${filePath}`);
      const [readError, readData] = await this.fileTool.execute({
        operation: FileOperation.READ,
        path: filePath,
      });

      if (readError) {
        this.logger.error(`Failed to read file: ${filePath}`, readError.message);
        continue;
      }

      const basename = path.basename(filePath, path.extname(filePath));
      const content = readData?.content || '';

      promptFiles.push({ name: basename, content });
    }

    return promptFiles;
  }

  private buildContexts(
    promptFiles: { name: string; content: string }[],
  ): Record<string, unknown> {
    const promptSections: Record<string, string> = {};

    for (const file of promptFiles) {
      const key = this.toSnakeCase(file.name);
      promptSections[key] = file.content;
    }

    return {
      user_defined_context: {
        ...promptSections,
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

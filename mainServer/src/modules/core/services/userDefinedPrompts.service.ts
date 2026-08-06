import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { AppDataDirectoryService } from './appDirectory.service';
import { USER_DEFINED_PROMPTS_DIRECTORY } from './userDefinedPrompts.constants';

@Injectable()
export class UserDefinedPromptsService implements OnModuleInit {
  private readonly logger = new Logger(UserDefinedPromptsService.name);

  private userDefinedPromptsDir: string;

  constructor(
    private readonly appDataDirectoryService: AppDataDirectoryService,
  ) {
    this.userDefinedPromptsDir = path.join(
      this.appDataDirectoryService.getAppDataPath(),
      USER_DEFINED_PROMPTS_DIRECTORY,
    );
  }

  async onModuleInit() {
    this.logger.debug(
      `Checking if directory exists: ${this.userDefinedPromptsDir}`,
    );
    try {
      await fs.access(this.userDefinedPromptsDir);
    } catch {
      this.logger.log(
        `Directory ${this.userDefinedPromptsDir} does not exist. Creating it...`,
      );
      try {
        await fs.mkdir(this.userDefinedPromptsDir, { recursive: true });
        this.logger.log(
          `Directory ${this.userDefinedPromptsDir} successfully created.`,
        );
      } catch (error: unknown) {
        this.logger.error(
          `Failed to create directory ${this.userDefinedPromptsDir}`,
          error instanceof Error ? error.message : String(error),
        );
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

  private async loadPromptFilesFromWorkspace(): Promise<
    { name: string; content: string }[]
  > {
    this.logger.debug(
      `Fetching list of files from: ${this.userDefinedPromptsDir}`,
    );

    let entries;
    try {
      entries = await fs.readdir(this.userDefinedPromptsDir, {
        withFileTypes: true,
      });
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        this.logger.debug(
          `User defined prompts directory does not exist, skipping: ${this.userDefinedPromptsDir}`,
        );
      } else {
        this.logger.warn(
          `Failed to list directory: ${this.userDefinedPromptsDir}. Error: ${err.message || String(error)}`,
        );
      }
      return [];
    }

    const promptFiles: { name: string; content: string }[] = [];

    for (const entry of entries) {
      if (
        entry.isFile() &&
        (entry.name.endsWith('.txt') || entry.name.endsWith('.md'))
      ) {
        const filePath = path.join(this.userDefinedPromptsDir, entry.name);
        this.logger.debug(`Reading prompt file: ${filePath}`);

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const basename = path.basename(entry.name, path.extname(entry.name));
          promptFiles.push({ name: basename, content });
        } catch (error: unknown) {
          this.logger.error(`Failed to read file: ${filePath}`, error instanceof Error ? error.message : String(error));
        }
      }
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

import * as fs from 'node:fs/promises';
import { FileOperation, ToolResponse } from '../file-tool.types';
import {
  FileOperationContext,
  FileOperationParams,
  IFileOperation,
} from './base.operation';

export class CreateOperation implements IFileOperation {
  constructor(private readonly context: FileOperationContext) {}

  async execute(params: FileOperationParams): Promise<ToolResponse> {
    const { path: inputPath, content } = params;
    if (!inputPath) {
      return {
        content: 'Path is required for create',
      };
    }
    if (!content) {
      return {
        content: 'Content is required for create',
      };
    }

    try {
      this.context.validateExtension(inputPath);
      const absolutePath = await this.context.validatePath(inputPath);

      if (content.length > this.context.maxFileSize) {
        return {
          content: 'File size exceeds limit of 200 KB',
        };
      }

      try {
        await fs.access(absolutePath);
        return {
          content: `File already exists at ${inputPath}`,
        };
      } catch {
        // File does not exist, proceed
      }

      await this.context.ensureDirectory(absolutePath);
      await fs.writeFile(absolutePath, content, 'utf8');

      return {
        content: `File created at ${inputPath}`,
        artifact: {
          status: 'success',
          operation: FileOperation.CREATE,
          path: inputPath,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        content: (error as Error).message,
      };
    }
  }
}

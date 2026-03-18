import * as fs from 'node:fs/promises';
import { FileOperation, ToolResponse } from '../file-tool.types';
import {
  FileOperationContext,
  FileOperationParams,
  IFileOperation,
} from './base.operation';

export class UpdateOperation implements IFileOperation {
  constructor(private readonly context: FileOperationContext) {}

  async execute(params: FileOperationParams): Promise<ToolResponse> {
    const { path: inputPath, content } = params;
    if (!inputPath) {
      return {
        content: 'Path is required for update',
      };
    }
    if (!content) {
      return {
        content: 'Content is required for update',
      };
    }

    try {
      const absolutePath = await this.context.validatePath(inputPath);

      if (content.length > this.context.maxFileSize) {
        return {
          content: 'File size exceeds limit of 200 KB',
        };
      }

      try {
        await fs.access(absolutePath);
        await fs.writeFile(absolutePath, content, 'utf8');

        return {
          content: `File updated at ${inputPath}`,
          artifact: {
            status: 'success',
            operation: FileOperation.UPDATE,
            path: inputPath,
          },
        };
      } catch {
        return {
          content: `File does not exist at ${inputPath}`,
        };
      }
    } catch (error: unknown) {
      return {
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

import * as fs from 'node:fs/promises';
import { FileOperation, ToolResponse } from '../file-tool.types';
import {
  FileOperationContext,
  FileOperationParams,
  IFileOperation,
} from './base.operation';

export class DeleteOperation implements IFileOperation {
  constructor(private readonly context: FileOperationContext) {}

  async execute(params: FileOperationParams): Promise<ToolResponse> {
    const { path: inputPath } = params;
    if (!inputPath) {
      return {
        content: 'Path is required for delete',
      };
    }

    try {
      const absolutePath = await this.context.validatePath(inputPath);
      try {
        const stats = await fs.stat(absolutePath);
        if (stats.isDirectory()) {
          return {
            content: 'Directories cannot be deleted',
          };
        }
        await fs.unlink(absolutePath);

        return {
          content: `File deleted at ${inputPath}`,
          artifact: {
            status: 'success',
            operation: FileOperation.DELETE,
            path: inputPath,
          },
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage === 'Directories cannot be deleted') {
          return {
            content: errorMessage,
          };
        }
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

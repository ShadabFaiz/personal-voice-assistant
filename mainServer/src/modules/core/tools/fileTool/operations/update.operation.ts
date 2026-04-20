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
      return [{ message: 'Path is required for update' }, null];
    }
    if (!content) {
      return [{ message: 'Content is required for update' }, null];
    }

    try {
      const absolutePath = await this.context.validatePath(inputPath);

      if (content.length > this.context.maxFileSize) {
        return [{ message: 'File size exceeds limit of 200 KB' }, null];
      }

      try {
        await fs.access(absolutePath);
        await fs.writeFile(absolutePath, content, 'utf8');

        return [
          null,
          {
            status: 'success',
            operation: FileOperation.UPDATE,
            path: inputPath,
          },
        ];
      } catch {
        return [{ message: `File does not exist at ${inputPath}` }, null];
      }
    } catch (error: unknown) {
      return [
        { message: error instanceof Error ? error.message : String(error) },
        null,
      ];
    }
  }
}

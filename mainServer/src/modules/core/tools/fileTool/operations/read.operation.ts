import * as fs from 'node:fs/promises';
import { FileOperation, ToolResponse } from '../file-tool.types';
import {
  FileOperationContext,
  FileOperationParams,
  IFileOperation,
} from './base.operation';

export class ReadOperation implements IFileOperation {
  constructor(private readonly context: FileOperationContext) {}

  async execute(params: FileOperationParams): Promise<ToolResponse> {
    const { path: inputPath } = params;
    if (!inputPath) {
      return {
        content: 'Path is required for read',
      };
    }

    try {
      const absolutePath = await this.context.validatePath(inputPath);
      try {
        const data = await fs.readFile(absolutePath, 'utf8');

        return {
          content: `File read from ${inputPath}`,
          artifact: {
            status: 'success',
            operation: FileOperation.READ,
            path: inputPath,
            content: data,
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

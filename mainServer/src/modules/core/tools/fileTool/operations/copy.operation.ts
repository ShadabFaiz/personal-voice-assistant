import * as fs from 'node:fs/promises';
import { FileOperation, ToolResponse } from '../file-tool.types';
import {
  FileOperationContext,
  FileOperationParams,
  IFileOperation,
} from './base.operation';

export class CopyOperation implements IFileOperation {
  constructor(private readonly context: FileOperationContext) {}

  async execute(params: FileOperationParams): Promise<ToolResponse> {
    const { path: inputPath, destination } = params;
    if (!inputPath || !destination) {
      return {
        content: 'Path and destination are required for copy',
      };
    }

    try {
      const absolutePath = await this.context.validatePath(inputPath);
      const absoluteDest = await this.context.validatePath(destination);
      this.context.validateExtension(destination);

      try {
        await fs.access(absolutePath);
      } catch {
        return {
          content: `Source file does not exist at ${inputPath}`,
        };
      }

      try {
        await fs.access(absoluteDest);
        return {
          content: `Destination already exists at ${destination}`,
        };
      } catch {
        // Success
      }

      await this.context.ensureDirectory(absoluteDest);
      await fs.copyFile(absolutePath, absoluteDest);

      return {
        content: `File copied from ${inputPath} to ${destination}`,
        artifact: {
          status: 'success',
          operation: FileOperation.COPY,
          path: destination,
        },
      };
    } catch (error: unknown) {
      return {
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

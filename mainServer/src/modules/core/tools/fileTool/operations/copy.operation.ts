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
      return [{ message: 'Path and destination are required for copy' }, null];
    }

    try {
      const absolutePath = await this.context.validatePath(inputPath);
      const absoluteDest = await this.context.validatePath(destination);
      this.context.validateExtension(destination);

      try {
        await fs.access(absolutePath);
      } catch {
        return [{ message: `Source file does not exist at ${inputPath}` }, null];
      }

      try {
        await fs.access(absoluteDest);
        return [{ message: `Destination already exists at ${destination}` }, null];
      } catch {
        // Success
      }

      await this.context.ensureDirectory(absoluteDest);
      await fs.copyFile(absolutePath, absoluteDest);

      return [
        null,
        {
          status: 'success',
          operation: FileOperation.COPY,
          path: destination,
        },
      ];
    } catch (error: unknown) {
      return [
        { message: error instanceof Error ? error.message : String(error) },
        null,
      ];
    }
  }
}

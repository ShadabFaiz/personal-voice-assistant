import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { FileOperation, ToolResponse } from '../file-tool.types';
import {
  FileOperationContext,
  FileOperationParams,
  IFileOperation,
} from './base.operation';

export class RenameOperation implements IFileOperation {
  constructor(private readonly context: FileOperationContext) {}

  async execute(params: FileOperationParams): Promise<ToolResponse> {
    const { path: inputPath, new_name } = params;
    if (!inputPath || !new_name) {
      return [{ message: 'Path and new_name are required for rename' }, null];
    }

    // Validation: new_name should NOT contain path separators
    if (new_name.includes('/') || new_name.includes('\\')) {
      return [
        { message: 'new_name must be a filename only, not a path' },
        null,
      ];
    }

    try {
      const absolutePath = await this.context.validatePath(inputPath);

      const dirPath = path.dirname(inputPath);
      const destinationLLMPath =
        dirPath === '/' ? `/${new_name}` : `${dirPath}/${new_name}`;

      const absoluteDest = await this.context.validatePath(destinationLLMPath);
      this.context.validateExtension(destinationLLMPath);

      try {
        await fs.access(absolutePath);
      } catch {
        return [
          { message: `Source file does not exist at ${inputPath}` },
          null,
        ];
      }

      try {
        await fs.access(absoluteDest);
        return [
          { message: `Destination already exists at ${destinationLLMPath}` },
          null,
        ];
      } catch {
        // Success: destination does not exist
      }

      await fs.rename(absolutePath, absoluteDest);

      return [
        null,
        {
          status: 'success',
          operation: FileOperation.RENAME,
          path: destinationLLMPath,
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

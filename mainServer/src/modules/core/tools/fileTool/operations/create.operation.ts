import * as fs from 'node:fs/promises';
import * as path from 'node:path';
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
      return [{ message: 'Path is required for create' }, null];
    }
    if (!content) {
      return [{ message: 'Content is required for create' }, null];
    }

    try {
      this.context.validateExtension(inputPath);
      const absolutePath = await this.context.validatePath(inputPath);

      if (content.length > this.context.maxFileSize) {
        return [{ message: 'File size exceeds limit of 200 KB' }, null];
      }

      try {
        await fs.access(absolutePath);
        return [{ message: `File already exists at ${inputPath}` }, null];
      } catch {
        // File does not exist, proceed
      }

      await this.context.ensureDirectory(absolutePath);

      const ext = path.extname(absolutePath).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const buffer = Buffer.from(content, 'base64');
        await fs.writeFile(absolutePath, buffer);
      } else {
        await fs.writeFile(absolutePath, content, 'utf8');
      }

      return [
        null,
        {
          status: 'success',
          operation: FileOperation.CREATE,
          path: inputPath,
        },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return [{ message: (error as Error).message }, null];
    }
  }
}

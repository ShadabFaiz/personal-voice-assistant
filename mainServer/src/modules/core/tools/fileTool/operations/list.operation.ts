import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { FileOperation, ToolResponse } from '../file-tool.types';
import {
  FileOperationContext,
  FileOperationParams,
  IFileOperation,
} from './base.operation';

export class ListOperation implements IFileOperation {
  constructor(private readonly context: FileOperationContext) {}

  async execute(params: FileOperationParams): Promise<ToolResponse> {
    const { path: inputPath } = params;
    if (!inputPath) {
      return {
        content: 'Path is required for list',
      };
    }
    if (!inputPath.endsWith('/')) {
      return {
        content: 'Path MUST end with "/" for list operation',
      };
    }

    try {
      const absolutePath = await this.context.validatePath(inputPath);
      try {
        const files = await fs.readdir(absolutePath, { withFileTypes: true });
        const paths = files
          .filter((f) => !f.name.startsWith('.')) // Filter hidden
          .map((f) => {
            const p = this.context.toLLMPath(path.join(absolutePath, f.name));
            return f.isDirectory() ? (p.endsWith('/') ? p : p + '/') : p;
          });

        return {
          content: `Listed ${paths.length} items in ${inputPath}`,
          artifact: {
            status: 'success',
            operation: FileOperation.LIST,
            paths,
          },
        };
      } catch {
        return {
          content: `Directory does not exist at ${inputPath}`,
        };
      }
    } catch (error: unknown) {
      return {
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

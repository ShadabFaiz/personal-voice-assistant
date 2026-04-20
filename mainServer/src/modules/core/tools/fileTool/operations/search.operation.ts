import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { FileOperation, SearchType, ToolResponse } from '../file-tool.types';
import {
  FileOperationContext,
  FileOperationParams,
  IFileOperation,
} from './base.operation';

export class SearchOperation implements IFileOperation {
  constructor(private readonly context: FileOperationContext) {}

  async execute(params: FileOperationParams): Promise<ToolResponse> {
    const { path: inputPath, query, search_type } = params;
    if (!search_type) {
      return [{ message: 'search_type is required for search' }, null];
    }
    if (!query) {
      return [{ message: 'query is required for search' }, null];
    }

    if (search_type === SearchType.CONTENT) {
      return [
        {
          message: 'Operation: search search_type: content is not implemented',
        },
        null,
      ];
    }

    try {
      const startPath = inputPath
        ? await this.context.validatePath(inputPath)
        : this.context.workspaceRoot;
      const results: Record<string, string>[] = [];

      const scan = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;

          const fullPath = path.join(dir, entry.name);
          const llmPath = this.context.toLLMPath(fullPath);

          if (search_type === SearchType.NAME && entry.isFile()) {
            if (entry.name.toLowerCase().includes(query.toLowerCase())) {
              results.push({ path: llmPath });
            }
          } else if (search_type === SearchType.PATH && entry.isDirectory()) {
            const dirLlmPath = llmPath.endsWith('/') ? llmPath : llmPath + '/';
            if (dirLlmPath.toLowerCase().includes(query.toLowerCase())) {
              results.push({ path: dirLlmPath });
            }
          }

          if (entry.isDirectory()) {
            await scan(fullPath);
          }

          if (results.length >= 20) break;
        }
      };

      await scan(startPath);

      return [
        null,
        {
          status: 'success',
          operation: FileOperation.SEARCH,
          results: results.slice(0, 20),
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

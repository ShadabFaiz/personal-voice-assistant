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
      return {
        content: 'search_type is required for search',
      };
    }
    if (!query) {
      return {
        content: 'query is required for search',
      };
    }

    if (search_type === SearchType.CONTENT) {
      return {
        content: 'Operation: search search_type: content is not implemented',
      };
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

      return {
        content: `Found ${results.length} results for query "${query}"`,
        artifact: {
          status: 'success',
          operation: FileOperation.SEARCH,
          results: results.slice(0, 20),
        },
      };
    } catch (error: unknown) {
      return {
        content: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

import { SearchType, ToolResponse } from '../file-tool.types';

export interface FileOperationParams {
  path?: string;
  content?: string;
  destination?: string;
  new_name?: string;
  query?: string;
  search_type?: SearchType;
}

export interface IFileOperation {
  execute(params: FileOperationParams): Promise<ToolResponse>;
}

export interface FileOperationContext {
  workspaceRoot: string;
  allowedExtensions: string[];
  maxFileSize: number;
  validatePath(filePath: string): Promise<string>;
  validateExtension(filePath: string): void;
  toLLMPath(absolutePath: string): string;
  ensureDirectory(filePath: string): Promise<void>;
}

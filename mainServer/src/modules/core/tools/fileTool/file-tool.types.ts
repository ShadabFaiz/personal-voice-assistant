export enum FileOperation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  SEARCH = 'search',
  COPY = 'copy',
  MOVE = 'move',
  RENAME = 'rename',
}

export enum SearchType {
  CONTENT = 'content',
  NAME = 'name',
  PATH = 'path',
}

export interface Artifact {
  status: string;
  operation: FileOperation;
  path?: string;
  content?: string;
  paths?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results?: any[];
}

export type ToolResponse = [{ message: string } | null, (Artifact | null)?];

export enum FileOperation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  SEARCH = 'search',
  COPY = 'copy',
  MOVE = 'move',
}

export enum SearchType {
  CONTENT = 'content',
  NAME = 'name',
  PATH = 'path',
}

export interface Artifact {
  status: string;
  operation: string;
  path?: string;
  content?: string;
  paths?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results?: any[];
}

export interface ToolResponse {
  content: string;
  artifact?: Artifact;
}

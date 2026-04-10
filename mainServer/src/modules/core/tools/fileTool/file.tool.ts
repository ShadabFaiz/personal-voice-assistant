import { tool } from '@langchain/core/tools';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { z } from 'zod';

import { AppConfig } from '@core/config';
import { ConfigService } from '@nestjs/config';
import { toolDescription } from './description';
import { FileOperation, SearchType, ToolResponse } from './file-tool.types';
import {
  FileOperationContext,
  IFileOperation,
} from './operations/base.operation';
import { CopyOperation } from './operations/copy.operation';
import { CreateOperation } from './operations/create.operation';
import { DeleteOperation } from './operations/delete.operation';
import { ListOperation } from './operations/list.operation';
import { MoveOperation } from './operations/move.operation';
import { ReadOperation } from './operations/read.operation';
import { RenameOperation } from './operations/rename.operation';
import { SearchOperation } from './operations/search.operation';
import { UpdateOperation } from './operations/update.operation';

@Injectable()
export class FileTool implements OnModuleInit {
  private readonly logger = new Logger(FileTool.name);
  private readonly workspaceRoot: string;
  private readonly allowedExtensions = [
    '.txt',
    '.md',
    '.csv',
    '.json',
    '.html',
    '.js',
  ];
  private readonly maxFileSize = 200 * 1024; // 200 KB
  private readonly operations: Map<FileOperation, IFileOperation>;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    // Workspace is relative to the project root
    this.workspaceRoot = path.resolve(
      process.cwd(),
      this.configService.get<string>(
        'AGENT_WORKSPACE_DIRECTORY_NAME',
      ) as string,
    );

    const context: FileOperationContext = {
      workspaceRoot: this.workspaceRoot,
      allowedExtensions: this.allowedExtensions,
      maxFileSize: this.maxFileSize,
      validatePath: (p) => this.validatePath(p),
      validateExtension: (e) => this.validateExtension(e),
      toLLMPath: (p) => this.toLLMPath(p),
      ensureDirectory: (p) => this.ensureDirectory(p),
    };

    this.operations = new Map<FileOperation, IFileOperation>([
      [FileOperation.CREATE, new CreateOperation(context)],
      [FileOperation.READ, new ReadOperation(context)],
      [FileOperation.UPDATE, new UpdateOperation(context)],
      [FileOperation.DELETE, new DeleteOperation(context)],
      [FileOperation.LIST, new ListOperation(context)],
      [FileOperation.SEARCH, new SearchOperation(context)],
      [FileOperation.COPY, new CopyOperation(context)],
      [FileOperation.MOVE, new MoveOperation(context)],
      [FileOperation.RENAME, new RenameOperation(context)],
    ]);
  }

  async onModuleInit() {
    try {
      await this.createAgentWorkspace();
    } catch (error: unknown) {
      this.logger.error(
        `Failed to initialize workspace: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async createAgentWorkspace() {
    try {
      await fs.access(this.workspaceRoot);
      this.logger.debug(`Workspace already exists at ${this.workspaceRoot}`);
    } catch {
      await fs.mkdir(this.workspaceRoot, { recursive: true });
      this.logger.debug(`Workspace created at ${this.workspaceRoot}`);
    }
  }

  private validatePath(filePath: string): Promise<string> {
    if (!filePath.startsWith('/')) {
      throw new Error('Path MUST start with "/"');
    }

    if (filePath.includes('..')) {
      throw new Error('Path traversal sequences must be rejected');
    }

    // Normalized path relative to LLM root
    const normalizedRelativePath = path.normalize(filePath);

    // Absolute path on host
    const absolutePath = path.join(this.workspaceRoot, normalizedRelativePath);

    // Security check: hidden files
    const parts = normalizedRelativePath.split(path.sep);
    if (
      parts.some(
        (part) =>
          part.startsWith('.') && part !== '' && part !== '.' && part !== '..',
      )
    ) {
      throw new Error('Hidden files or directories are not allowed');
    }

    // Security check: resolution outside workspace
    if (!absolutePath.startsWith(this.workspaceRoot)) {
      throw new Error('Access outside workspace denied');
    }

    return Promise.resolve(absolutePath);
  }

  private validateExtension(filePath: string) {
    const ext = path.extname(filePath);
    if (!this.allowedExtensions.includes(ext)) {
      throw new Error(
        `Invalid file extension: ${ext}. Allowed: ${this.allowedExtensions.join(', ')}`,
      );
    }
  }

  private toLLMPath(absolutePath: string): string {
    let relative = path.relative(this.workspaceRoot, absolutePath);
    if (!relative.startsWith('/')) {
      relative = '/' + relative;
    }
    // Directories should end with /
    return relative;
  }

  private async ensureDirectory(filePath: string) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  async execute(params: {
    operation: FileOperation;
    path?: string;
    content?: string;
    destination?: string;
    new_name?: string;
    query?: string;
    search_type?: SearchType;
  }): Promise<ToolResponse> {
    const operation = this.operations.get(params.operation);
    if (!operation) {
      return [{ message: `Unknown operation: ${params.operation}` }];
    }
    return operation.execute(params);
  }

  getFileTool() {
    return tool((params) => this.execute(params), {
      name: 'file_tool',
      description: toolDescription,
      schema: z.object({
        operation: z.enum(FileOperation),
        path: z.string().optional(),
        content: z.string().optional(),
        destination: z.string().optional(),
        new_name: z.string().optional(),
        query: z.string().optional(),
        search_type: z.enum(SearchType).optional(),
      }),
      responseFormat: 'content_and_artifact',
    });
  }

  getAllTools() {
    return [this.getFileTool()];
  }
}

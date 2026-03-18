import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileOperation, SearchType } from './file-tool.types';
import { FileTool } from './file.tool';

jest.mock('fs/promises');

describe('FileTool', () => {
  let service: FileTool;
  const workspaceRoot = path.resolve(process.cwd(), 'agent_workspace');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileTool],
    }).compile();

    service = module.get<FileTool>(FileTool);
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create workspaceRoot if it does not exist on module init', async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error('not found'));
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      await service.onModuleInit();
      expect(fs.access).toHaveBeenCalledWith(workspaceRoot);
      expect(fs.mkdir).toHaveBeenCalledWith(workspaceRoot, { recursive: true });
    });

    it('should NOT create workspaceRoot if it already exists on module init', async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      await service.onModuleInit();
      expect(fs.access).toHaveBeenCalledWith(workspaceRoot);
      expect(fs.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('Path Validation', () => {
    it('should throw error if path does not start with /', async () => {
      const [error] = await service.execute({
        operation: FileOperation.READ,
        path: 'test.txt',
      });
      expect(error?.message).toBe('Path MUST start with "/"');
    });

    it('should throw error if path contains traversal sequence', async () => {
      const [error] = await service.execute({
        operation: FileOperation.READ,
        path: '/../outside.txt',
      });
      expect(error?.message).toBe('Path traversal sequences must be rejected');
    });

    it('should throw error if path contains hidden file', async () => {
      const [error] = await service.execute({
        operation: FileOperation.READ,
        path: '/.hidden.txt',
      });
      expect(error?.message).toBe('Hidden files or directories are not allowed');
    });
  });

  describe('Operations', () => {
    it('should create a file', async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error('not found'));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const [error, data] = await service.execute({
        operation: FileOperation.CREATE,
        path: '/test.md',
        content: 'hello world',
      });

      expect(error).toBeNull();
      expect(data?.path).toBe('/test.md');
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(workspaceRoot, 'test.md'),
        'hello world',
        'utf8'
      );
    });

    it('should fail to create if file exists', async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const [error] = await service.execute({
        operation: FileOperation.CREATE,
        path: '/test.md',
        content: 'hello world',
      });

      expect(error?.message).toContain('File already exists');
    });

    it('should fail to create with invalid extension', async () => {
      const [error] = await service.execute({
        operation: FileOperation.CREATE,
        path: '/test.exe',
        content: 'hello world',
      });

      expect(error?.message).toContain('Invalid file extension');
    });

    it('should read a file', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('file content');

      const [error, data] = await service.execute({
        operation: FileOperation.READ,
        path: '/test.md',
      });

      expect(error).toBeNull();
      expect(data?.content).toBe('file content');
    });

    it('should fail to read if file does not exist', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('not found'));

      const [error] = await service.execute({
        operation: FileOperation.READ,
        path: '/missing.md',
      });

      expect(error?.message).toContain('File does not exist');
    });

    it('should list directory contents', async () => {
      const mockEntries = [
        { name: 'file1.txt', isDirectory: () => true, isFile: () => false }, // actually it's a file but list uses isDirectory for naming
        { name: 'dir1', isDirectory: () => true, isFile: () => false },
        { name: '.hidden', isDirectory: () => false, isFile: () => true },
      ];
      // Note: my list operation uses f.isDirectory() to append "/"
      const mockEntriesCorrected = [
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
        { name: 'dir1', isDirectory: () => true, isFile: () => false },
        { name: '.hidden', isDirectory: () => false, isFile: () => true },
      ];
      (fs.readdir as jest.Mock).mockResolvedValue(mockEntriesCorrected);

      const [error, data] = await service.execute({
        operation: FileOperation.LIST,
        path: '/notes/',
      });

      expect(error).toBeNull();
      expect(data?.paths).toEqual(['/notes/file1.txt', '/notes/dir1/']);
    });

    it('should fail list if path does not end with /', async () => {
      const [error] = await service.execute({
        operation: FileOperation.LIST,
        path: '/notes',
      });
      expect(error?.message).toBe('Path MUST end with "/" for list operation');
    });

    it('should search by name', async () => {
      const mockEntries = [
        { name: 'test.md', isDirectory: () => false, isFile: () => true },
        { name: 'other.txt', isDirectory: () => false, isFile: () => true },
      ];
      (fs.readdir as jest.Mock).mockResolvedValue(mockEntries);

      const [error, data] = await service.execute({
        operation: FileOperation.SEARCH,
        path: '/',
        query: 'test',
        search_type: SearchType.NAME,
      });

      expect(error).toBeNull();
      expect(data?.results).toEqual([{ path: '/test.md' }]);
    });

    it('should NOT support content search', async () => {
      const [error] = await service.execute({
        operation: FileOperation.SEARCH,
        path: '/',
        query: 'something',
        search_type: SearchType.CONTENT,
      });

      expect(error?.message).toBe('Operation: search search_type: content is not implemented');
    });
  });
});

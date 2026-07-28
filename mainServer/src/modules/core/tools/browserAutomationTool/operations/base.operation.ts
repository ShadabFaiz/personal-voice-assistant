import { Page } from 'playwright';
import { FileTool } from '../../fileTool/file.tool';
import { BrowserOperation } from '../browser-automation.types';

export interface BrowserOperationParams {
  operation: BrowserOperation;
  payload?: Record<string, any>;
}

export interface IBrowserOperation {
  execute(params: BrowserOperationParams): Promise<string>;
}

export interface BrowserOperationContext {
  getPage(): Promise<Page>;
  getPagesMap(): Map<string, Page>;
  setActivePageId(id: string): void;
  getActivePageId(): string | null;
  getBrowserContext(): any;
  fileTool: FileTool;
}

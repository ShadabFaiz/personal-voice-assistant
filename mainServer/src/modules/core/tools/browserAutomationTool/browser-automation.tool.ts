import { tool } from '@langchain/core/tools';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import { z } from 'zod';
import * as path from 'node:path';
import { FileTool } from '../fileTool/file.tool';
import { BrowserOperation } from './browser-automation.types';
import {
  BrowserOperationContext,
  ClickOperation,
  CloseOperation,
  EvaluateOperation,
  FillOperation,
  GotoOperation,
  IBrowserOperation,
  PauseForInputOperation,
  ScreenshotOperation,
  ListTabsOperation,
  NewTabOperation,
  SwitchTabOperation,
  WaitForOperation,
} from './operations';
import { toolDescription } from './description';

@Injectable()
export class BrowserAutomationTool implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserAutomationTool.name);
  private browser: Browser | null = null;
  public readonly pageTracker = new Map<string, Page>();
  public activePageId: string | null = null;
  public browserContext: any = null;
  private operations: Map<BrowserOperation, IBrowserOperation> = new Map();

  constructor(
    private readonly fileTool: FileTool
  ) {
    const context: BrowserOperationContext = {
      getPage: async () => this.getActivePage(),
      getPagesMap: () => this.pageTracker,
      setActivePageId: (id: string) => { this.activePageId = id; },
      getActivePageId: () => this.activePageId,
      getBrowserContext: () => this.browserContext,
      fileTool: this.fileTool,
    };

    this.operations = new Map<BrowserOperation, IBrowserOperation>([
      [BrowserOperation.GOTO, new GotoOperation(context)],
      [BrowserOperation.CLICK, new ClickOperation(context)],
      [BrowserOperation.FILL, new FillOperation(context)],
      [BrowserOperation.SCREENSHOT, new ScreenshotOperation(context)],
      [BrowserOperation.EVALUATE, new EvaluateOperation(context)],
      [BrowserOperation.CLOSE, new CloseOperation(context, () => this.closeBrowser())],
      [BrowserOperation.PAUSE_FOR_INPUT, new PauseForInputOperation(context)],
      [BrowserOperation.LIST_TABS, new ListTabsOperation(context)],
      [BrowserOperation.NEW_TAB, new NewTabOperation(context)],
      [BrowserOperation.SWITCH_TAB, new SwitchTabOperation(context)],
      [BrowserOperation.WAIT_FOR, new WaitForOperation(context)],
    ]);
  }

  private getActivePage(): Page {
    if (!this.activePageId) throw new Error("No active page.");
    const page = this.pageTracker.get(this.activePageId);
    if (!page) throw new Error("Active page pointer is dead.");
    return page;
  }

  async onModuleDestroy() {
    await this.closeBrowser();
  }

  private async initBrowser(payload?: Record<string, any>): Promise<void> {
    if (!this.browser) {
      this.logger.debug('Launching Playwright browser...');
      const launchArgs: any = {
        headless: false,
        args: [
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--disable-web-security',
          '--no-sandbox',
          '--disable-blink-features=AutomationControlled',
        ],
      };
      
      if (payload?.channel) {
        launchArgs.channel = payload.channel;
      }
      
      this.browser = await chromium.launch(launchArgs);
      
      this.browserContext = await this.browser.newContext({
        ignoreHTTPSErrors: true,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        locale: 'en-US',
      });
      
      await this.browserContext.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });
      
      const newPage = await this.browserContext.newPage();
      const initialId = `tab_${Date.now()}`;
      this.pageTracker.set(initialId, newPage);
      this.activePageId = initialId;
      
      newPage.on('close', () => {
         this.pageTracker.delete(initialId);
         if (this.activePageId === initialId) this.activePageId = null;
      });
    }
  }

  private async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.browserContext = null;
      this.pageTracker.clear();
      this.activePageId = null;
    }
  }

  private async performOperation(operationType: BrowserOperation, payload?: Record<string, any>): Promise<string> {
    this.logger.log(`Executing operation: ${operationType} with payload: ${JSON.stringify(payload || {})}`);

    try {
      if (!this.browser && operationType !== BrowserOperation.CLOSE) {
        await this.initBrowser(payload);
      }
      
      const op = this.operations.get(operationType);
      if (!op) {
        return `Unknown operation: ${operationType}.`;
      }
      
      const result = await op.execute({ operation: operationType, payload });
      return result;
    } catch (error) {
      this.logger.error(`Error in BrowserAutomationTool[${operationType}]:`, error);
      return `Error performing '${operationType}': ${(error as Error).message}`;
    }
  }

  private getBrowserTool() {
    return tool(
      async (input: { operation: BrowserOperation; payload?: Record<string, any> }) => {
        return this.performOperation(input.operation, input.payload);
      },
      {
        name: 'browser_automation',
        description: toolDescription,
        responseFormat: 'content',
        schema: z.object({
          operation: z.nativeEnum(BrowserOperation).describe('The action to perform'),
          payload: z.record(z.any()).optional().describe('Contextual data for the operation (e.g. url, selector, text, filename, timeout, code)'),
        }),
      },
    );
  }

  getAllTools() {
    console.log('BrowserAutomationTool: getting all tools...');
    return [this.getBrowserTool()] as const;
  }
}

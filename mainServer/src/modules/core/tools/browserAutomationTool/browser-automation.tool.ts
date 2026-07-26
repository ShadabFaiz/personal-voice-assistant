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
} from './operations';
import { toolDescription } from './description';

@Injectable()
export class BrowserAutomationTool implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserAutomationTool.name);
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly operations: Map<BrowserOperation, IBrowserOperation>;

  constructor(
    private readonly fileTool: FileTool
  ) {
    const context: BrowserOperationContext = {
      getPage: () => this.getBrowserPage(),
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
    ]);
  }

  async onModuleDestroy() {
    await this.closeBrowser();
  }

  private async getBrowserPage(): Promise<Page> {
    if (!this.browser) {
      this.logger.debug('Launching Playwright browser...');
      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--disable-web-security',
          '--no-sandbox',
          '--disable-blink-features=AutomationControlled',
        ],
      });
      const context = await this.browser.newContext({
        ignoreHTTPSErrors: true,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        locale: 'en-US',
      });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });
      this.page = await context.newPage();
    }
    return this.page!;
  }

  private async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  private async performOperation(operationType: BrowserOperation, payload?: Record<string, any>): Promise<string> {
    this.logger.log(`Executing operation: ${operationType} with payload: ${JSON.stringify(payload || {})}`);

    try {
      const op = this.operations.get(operationType);
      if (!op) {
        return `Unknown operation: ${operationType}. Supported: goto, click, fill, screenshot, evaluate, close, pause_for_input`;
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

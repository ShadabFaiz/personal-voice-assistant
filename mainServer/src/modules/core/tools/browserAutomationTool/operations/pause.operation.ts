import {
  BrowserOperationContext,
  BrowserOperationParams,
  IBrowserOperation,
} from './base.operation';

export class PauseForInputOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}

  async execute(params: BrowserOperationParams): Promise<string> {
    const timeout = params.payload?.timeout || 15000;
    const page = await this.context.getPage();
    await page.waitForTimeout(timeout);
    return `Paused execution for ${timeout}ms.`;
  }
}

import { BrowserOperationContext, BrowserOperationParams, IBrowserOperation } from './base.operation';

export class ClickOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}

  async execute(params: BrowserOperationParams): Promise<string> {
    const clickSelector = params.payload?.selector;
    if (!clickSelector) throw new Error('Missing "selector" in payload');
    const page = await this.context.getPage();
    await page.click(clickSelector, { timeout: 10000 });
    return `Clicked on ${clickSelector}`;
  }
}

import { BrowserOperationContext, BrowserOperationParams, IBrowserOperation } from './base.operation';

export class FillOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}

  async execute(params: BrowserOperationParams): Promise<string> {
    const fillSelector = params.payload?.selector;
    const text = params.payload?.text;
    if (!fillSelector || text === undefined) throw new Error('Missing "selector" or "text" in payload');
    const page = await this.context.getPage();
    await page.fill(fillSelector, text);
    return `Filled ${fillSelector} with provided text.`;
  }
}

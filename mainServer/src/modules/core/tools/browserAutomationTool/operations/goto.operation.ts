import {
  BrowserOperationContext,
  BrowserOperationParams,
  IBrowserOperation,
} from './base.operation';

export class GotoOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}

  async execute(params: BrowserOperationParams): Promise<string> {
    const url = params.payload?.url;
    if (!url) throw new Error('Missing "url" in payload');
    const page = await this.context.getPage();
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    return `Navigated to ${url}`;
  }
}

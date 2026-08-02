import {
  BrowserOperationContext,
  BrowserOperationParams,
  IBrowserOperation,
} from './base.operation';

export class FillOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}

  async execute(params: BrowserOperationParams): Promise<string> {
    const fillSelector = params.payload?.selector;
    const text = params.payload?.text;
    if (!fillSelector || text === undefined)
      throw new Error('Missing "selector" or "text" in payload');
    const page = await this.context.getPage();
    // Swap back from .fill() to .type() with an organic keystroke delay to bypass modern SPA anti-bot hooks.
    await page.type(fillSelector, text, { delay: 90 });
    return `Organically typed ${fillSelector} with provided text.`;
  }
}

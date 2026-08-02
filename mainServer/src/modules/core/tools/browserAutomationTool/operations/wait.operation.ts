import {
  BrowserOperationContext,
  BrowserOperationParams,
  IBrowserOperation,
} from './base.operation';

export class WaitForOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}
  async execute(params: BrowserOperationParams): Promise<string> {
    const page = await this.context.getPage();
    const { type, target, timeout = 30000 } = params.payload || {};

    if (!type || !target) {
      return 'Error: wait_for requires a "type" ("selector", "function") and a "target" payload argument.';
    }

    try {
      if (type === 'selector') {
        await page.waitForSelector(target, { timeout, state: 'visible' });
        return `Successfully verified selector: ${target}`;
      }
      if (type === 'function') {
        await page.waitForFunction(target, undefined, { timeout });
        return `Successfully evaluated dynamic function condition: ${target}`;
      }
      return `Error: Unknown wait type "${type}". Supported types: selector, function`;
    } catch (e: any) {
      return `Wait timeout/error: ${e.message}`;
    }
  }
}

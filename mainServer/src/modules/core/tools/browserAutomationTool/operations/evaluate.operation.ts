import { BrowserOperationContext, BrowserOperationParams, IBrowserOperation } from './base.operation';

export class EvaluateOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}

  async execute(params: BrowserOperationParams): Promise<string> {
    const code = params.payload?.code;
    if (!code) throw new Error('Missing "code" in payload');
    const page = await this.context.getPage();
    const result = await page.evaluate(code);
    return `Evaluated script. Result: ${JSON.stringify(result)}`;
  }
}

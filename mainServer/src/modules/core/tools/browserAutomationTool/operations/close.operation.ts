import { BrowserOperationContext, BrowserOperationParams, IBrowserOperation } from './base.operation';

export class CloseOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext, private readonly closeFn: () => Promise<void>) {}

  async execute(): Promise<string> {
    await this.closeFn();
    return 'Browser closed.';
  }
}

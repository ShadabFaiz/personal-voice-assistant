import { BrowserOperationContext, BrowserOperationParams, IBrowserOperation } from './base.operation';

export class ListTabsOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}
  async execute(params: BrowserOperationParams): Promise<string> {
    const map = this.context.getPagesMap();
    const result = Array.from(map.entries()).map(([tabId, page]) => ({
      tabId,
      url: page.url(),
    }));
    return JSON.stringify(result);
  }
}

export class SwitchTabOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}
  async execute(params: BrowserOperationParams): Promise<string> {
    const { tabId } = params.payload || {};
    if (!tabId) return 'Error: tabId payload string required for switch_tab.';
    
    const map = this.context.getPagesMap();
    if (!map.has(tabId)) {
       return `Error: Tab ID '${tabId}' not found. Current tabs: ` + Array.from(map.keys()).join(', ');
    }
    
    this.context.setActivePageId(tabId);
    
    const result = Array.from(map.entries()).map(([id, page]) => ({ tabId: id, url: page.url() }));
    return `Switched active context to tab: ${tabId}. Active Tabs: ${JSON.stringify(result)}`;
  }
}

export class NewTabOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}
  async execute(params: BrowserOperationParams): Promise<string> {
    const browserContext = this.context.getBrowserContext();
    if (!browserContext) return 'Error: Browser context is not initialized.';
    
    const newPage = await browserContext.newPage();
    const initialId = `tab_${Date.now()}`;
    const map = this.context.getPagesMap();
    
    map.set(initialId, newPage);
    this.context.setActivePageId(initialId);
    
    newPage.on('close', () => {
       map.delete(initialId);
       if (this.context.getActivePageId() === initialId) {
          this.context.setActivePageId(null as any); 
       }
    });

    const result = Array.from(map.entries()).map(([id, page]) => ({ tabId: id, url: page.url() }));
    return `New tab spawned successfully: ${initialId}. Active Tabs: ${JSON.stringify(result)}`;
  }
}

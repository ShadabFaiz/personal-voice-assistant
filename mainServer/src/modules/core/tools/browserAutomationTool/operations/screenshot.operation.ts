import {
  BrowserOperationContext,
  BrowserOperationParams,
  IBrowserOperation,
} from './base.operation';
import { FileOperation } from '../../fileTool/file-tool.types';
import * as path from 'path';

export class ScreenshotOperation implements IBrowserOperation {
  constructor(private readonly context: BrowserOperationContext) {}

  async execute(params: BrowserOperationParams): Promise<string> {
    const page = await this.context.getPage();
    const payload = params.payload;
    const filename =
      payload?.filename || `/screenshots/screenshot_${Date.now()}.png`;
    const buffer = await page.screenshot({
      fullPage: payload?.fullPage || false,
    });
    const base64Data = buffer.toString('base64');

    // FileTool fully manages the workspace boundary and OS translation
    const response = await this.context.fileTool.execute({
      operation: FileOperation.CREATE,
      path: filename,
      content: base64Data,
    });

    if (response[0] !== null) {
      throw new Error(
        `Failed to save screenshot via FileTool: ${response[0].message}`,
      );
    }

    return `Screenshot saved at: ${filename}`;
  }
}

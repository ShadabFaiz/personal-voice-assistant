import { DynamicTool } from '@langchain/core/tools';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';
import { BraveSearchTool } from './braveSearchTool/brave-search.tool';
import { DateTimeTool } from './dateTimeTools/dateTime.tool';
import { DuckDuckGoWebSearchTool } from './duckDuckGoSearchTool/duck-duck-go-search.tool';
import { FileTool } from './fileTool/file.tool';
import { GmailTool } from './gmail/gmail.tool';
import { LocationTool } from './locationTool/location.tool';
import { TempMailTool } from './tempMailTool/temp-mail.tool';
import { WebPageFetcherTool } from './webPageFetcherTool/web-page-fetcher.tool';
import { BrowserAutomationTool } from './browserAutomationTool/browser-automation.tool';

@Injectable()
export class ToolsService implements OnModuleInit {
  private readonly logger = new Logger(ToolsService.name);
  public dateToolRunnable!: DynamicTool;

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly dateTimeTool: DateTimeTool,
    private readonly braveSearchTool: BraveSearchTool,
    private readonly duckDuckGoWebSearchTool: DuckDuckGoWebSearchTool,
    private readonly locationTool: LocationTool,
    private readonly webPageFetcherTool: WebPageFetcherTool,
    private readonly fileTool: FileTool,
    private readonly gmailTool: GmailTool,
    private readonly tempMailTool: TempMailTool,
    private readonly browserAutomationTool: BrowserAutomationTool,
  ) {}

  onModuleInit() {
    this.logger.log('ToolsService module init');
  }

  getAllTools() {
    const searchEngine = this.configService.get('SEARCH_ENGINE', {
      infer: true,
    });
    this.logger.debug(
      `Fetching all tools. Using search engine: ${searchEngine}`,
    );

    const searchTools =
      searchEngine === 'brave'
        ? this.braveSearchTool.getAllTools()
        : this.duckDuckGoWebSearchTool.getAllTools();

    return [
      ...this.dateTimeTool.getAllTools(),
      ...searchTools,
      ...this.locationTool.getAllTools(),
      ...this.webPageFetcherTool.getAllTools(),
      ...this.fileTool.getAllTools(),
      ...this.gmailTool.getAllTools(),
      ...this.tempMailTool.getAllTools(),
      ...this.browserAutomationTool.getAllTools(),
    ];
  }
}

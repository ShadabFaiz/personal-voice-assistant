import Mailjs from '@cemalgnlts/mailjs';
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigFunction } from './config/configuration';
import { AppDataDirectoryService } from './services/appDirectory.service';
import { LLMWorkflowService } from './services/llmWorkflow.service';
import { SystemPromptsService } from './services/systemPrompts.service';
import { UserDefinedPromptsService } from './services/userDefinedPrompts.service';
import { BraveSearchTool } from './tools/braveSearchTool/brave-search.tool';
import { DateTimeTool } from './tools/dateTimeTools/dateTime.tool';
import { DuckDuckGoWebSearchTool } from './tools/duckDuckGoSearchTool/duck-duck-go-search.tool';
import { FileTool } from './tools/fileTool/file.tool';
import { GmailTool } from './tools/gmail/gmail.tool';
import { LocationTool } from './tools/locationTool/location.tool';
import { TempMailTool } from './tools/tempMailTool/temp-mail.tool';
import { ToolsService } from './tools/tools.service';
import { WebPageFetcherTool } from './tools/webPageFetcherTool/web-page-fetcher.tool';
import { BrowserAutomationTool } from './tools/browserAutomationTool/browser-automation.tool';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfigFunction],
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    LLMWorkflowService,
    SystemPromptsService,
    UserDefinedPromptsService,
    {
      provide: DateTimeTool,
      useClass: DateTimeTool,
    },
    {
      provide: BraveSearchTool,
      useClass: BraveSearchTool,
    },
    {
      provide: DuckDuckGoWebSearchTool,
      useClass: DuckDuckGoWebSearchTool,
    },
    {
      provide: LocationTool,
      useClass: LocationTool,
    },
    {
      provide: ToolsService,
      useClass: ToolsService,
    },
    {
      provide: WebPageFetcherTool,
      useClass: WebPageFetcherTool,
    },
    FileTool,
    GmailTool,
    TempMailTool,
    Mailjs,
    AppDataDirectoryService,
    BrowserAutomationTool,
  ],
  exports: [
    LLMWorkflowService,
    SystemPromptsService,
    UserDefinedPromptsService,
    DateTimeTool,
    BraveSearchTool,
    DuckDuckGoWebSearchTool,
    LocationTool,
    ToolsService,
    WebPageFetcherTool,
    FileTool,
    GmailTool,
    TempMailTool,
    Mailjs,
    AppDataDirectoryService,
    BrowserAutomationTool,
  ],
})
export class CoreModule {}

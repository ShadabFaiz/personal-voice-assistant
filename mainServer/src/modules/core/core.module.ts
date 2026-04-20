import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigFunction } from './config/configuration';
import { LLMWorkflowService } from './services/llmWorkflow.service';
import { SystemPromptsService } from './services/systemPrompts.service';
import { BraveSearchTool } from './tools/braveSearchTool/brave-search.tool';
import { DateTimeTool } from './tools/dateTimeTools/dateTime.tool';
import { DuckDuckGoWebSearchTool } from './tools/duckDuckGoSearchTool/duck-duck-go-search.tool';
import { FileTool } from './tools/fileTool/file.tool';
import { GmailTool } from './tools/gmail/gmail.tool';
import { LocationTool } from './tools/locationTool/location.tool';
import { ToolsService } from './tools/tools.service';
import { WebPageFetcherTool } from './tools/webPageFetcherTool/web-page-fetcher.tool';

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
  ],
  exports: [
    LLMWorkflowService,
    SystemPromptsService,
    DateTimeTool,
    BraveSearchTool,
    DuckDuckGoWebSearchTool,
    LocationTool,
    ToolsService,
    WebPageFetcherTool,
    FileTool,
    GmailTool,
  ],
})
export class CoreModule {}

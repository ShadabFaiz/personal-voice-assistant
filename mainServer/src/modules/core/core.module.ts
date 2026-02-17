import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigFunction } from './config/configuration';
import { LLMWorkflowService } from './services/llmWorkflow.service';
import { SystemPromptsService } from './services/systemPrompts.service';
import { CliTool } from './tools/cliTool/cli.tool';
import { DateTimeTool } from './tools/dateTimeTools/dateTime.tool';
import { ToolsService } from './tools/tools.service';
import { WeatherTool } from './tools/weatherTool/weather.tool';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfigFunction],
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
      provide: WeatherTool,
      useClass: WeatherTool,
    },
    {
      provide: CliTool,
      useClass: CliTool,
    },
    {
      provide: ToolsService,
      useClass: ToolsService,
    },
  ],
  exports: [
    LLMWorkflowService,
    SystemPromptsService,
    DateTimeTool,
    WeatherTool,
    CliTool,
    ToolsService,
  ],
})
export class CoreModule {}

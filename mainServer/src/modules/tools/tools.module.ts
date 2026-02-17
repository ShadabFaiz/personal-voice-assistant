import { Global, Module } from '@nestjs/common';
import { CliTool } from './cliTool/cli.tool';
import { DateTimeTool } from './dateTimeTools/dateTime.tool';
import { ToolsService } from './tools.service';
import { WeatherTool } from './weatherTool/weather.tool';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
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
  exports: [DateTimeTool, WeatherTool, CliTool, ToolsService],
})
export class ToolsModule {}

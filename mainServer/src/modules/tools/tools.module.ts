import { Module } from '@nestjs/common';
import { CliTool } from './cliTool/cli.tool';
import { DateTimeTool } from './dateTimeTools/dateTime.tool';
import { WeatherTool } from './weatherTool/weather.tool';

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
  ],
  exports: [DateTimeTool, WeatherTool, CliTool],
})
export class ToolsModule {}

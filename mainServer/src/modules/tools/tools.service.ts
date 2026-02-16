import { DynamicTool, tool } from '@langchain/core/tools';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DateTimeTool } from './dateTimeTools/dateTime.tool';

@Injectable()
export class ToolsService implements OnModuleInit {
  private readonly logger = new Logger(ToolsService.name);
  public dateToolRunnable!: DynamicTool;

  constructor(private readonly dateTimeTool: DateTimeTool) {}

  onModuleInit() {
    this.logger.log('ToolsService module init');
    this.initializeDateTool();
  }

  private initializeDateTool() {
    this.dateToolRunnable = tool(
      async () => {
        const response = this.dateTimeTool.getDate();
        return response;
      },
      {
        name: 'getDate',
        description: 'Get current date',
        responseFormat: 'content',
      },
    );
  }

  getAllTools(): DynamicTool[] {
    this.logger.log('Fetching all tools');
    return [this.dateToolRunnable];
  }
}

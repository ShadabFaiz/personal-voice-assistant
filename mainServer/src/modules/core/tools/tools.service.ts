import { DynamicTool } from '@langchain/core/tools';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DateTimeTool } from './dateTimeTools/dateTime.tool';

@Injectable()
export class ToolsService implements OnModuleInit {
  private readonly logger = new Logger(ToolsService.name);
  public dateToolRunnable!: DynamicTool;

  constructor(private readonly dateTimeTool: DateTimeTool) {}

  onModuleInit() {
    this.logger.log('ToolsService module init');
  }

  getAllTools() {
    this.logger.log('Fetching all tools');
    return [...this.dateTimeTool.getAllTools()];
  }
}

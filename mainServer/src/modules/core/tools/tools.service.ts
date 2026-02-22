import { DynamicTool } from '@langchain/core/tools';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BraveSearchTool } from './braveSearchTool/brave-search.tool';
import { DateTimeTool } from './dateTimeTools/dateTime.tool';
import { LocationTool } from './locationTool/location.tool';

@Injectable()
export class ToolsService implements OnModuleInit {
  private readonly logger = new Logger(ToolsService.name);
  public dateToolRunnable!: DynamicTool;

  constructor(
    private readonly dateTimeTool: DateTimeTool,
    private readonly braveSearchTool: BraveSearchTool,
    private readonly locationTool: LocationTool,
  ) {}

  onModuleInit() {
    this.logger.log('ToolsService module init');
  }

  getAllTools() {
    this.logger.log('Fetching all tools');
    return [
      ...this.dateTimeTool.getAllTools(),
      ...this.braveSearchTool.getAllTools(),
      ...this.locationTool.getAllTools(),
    ];
  }
}

import { BaseTool } from '../base.tool';

export class WeatherTool extends BaseTool {
  public executeCommand() {
    console.log('hello world.');
    return 'Sunny';
  }
}

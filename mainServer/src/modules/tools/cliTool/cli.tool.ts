import { BaseTool } from '../base.tool';

export class CliTool extends BaseTool {
  public executeCommand() {
    console.log('hello world.');
    return 'Command executed';
  }
}

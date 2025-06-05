import { BaseTool } from '../base.tool';
import { GetDateFunctionResponse } from './interfaces/getDateFunction';
import { GetDateTimeFunctionResponse } from './interfaces/getDateTimeFunction';
import { DAYS, GetDayFunctionResponse } from './interfaces/getDayFunction';
import { GetTimeFunctionResponse } from './interfaces/getTimeFunction';

export class DateTimeTool extends BaseTool {
  public executeCommand() {
    console.log('hello world.');
    return new Date();
  }

  public getTime(): GetTimeFunctionResponse {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return {
      time: `${hours}:${minutes}:${seconds}`,
      format: 'HH:mm:ss',
    };
  }

  public getDate(): GetDateFunctionResponse {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return {
      date: `${year}-${month}-${day}`,
      format: 'YYYY-MM-DD',
    };
  }

  public getDateTime(): GetDateTimeFunctionResponse {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return {
      date: {
        date: `${year}-${month}-${day}`,
        format: 'YYYY-MM-DD',
      },
      time: {
        time: `${hours}:${minutes}:${seconds}`,
        format: 'HH:mm:ss',
      },
    };
  }

  public getDay(): GetDayFunctionResponse {
    const now = new Date();
    const day = now.getDay();
    return {
      day: DAYS[day],
    };
  }
}

import { tool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { DAYS } from './constants';

@Injectable()
export class DateTimeTool {
  private getTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return {
      time: `${hours}:${minutes}:${seconds}`,
      format: 'HH:mm:ss',
    };
  }

  private getDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return {
      date: `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`,
      format: 'YYYY-MM-DD',
    };
  }

  private getDateTime() {
    const date = this.getDate();
    const time = this.getTime();
    return {
      date,
      time,
    };
  }

  private getDay() {
    const now = new Date();
    const day = now.getDay();
    const daysMap = [DAYS.SUNDAY, DAYS.MONDAY, DAYS.TUESDAY, DAYS.WEDNESDAY, DAYS.THURSDAY, DAYS.FRIDAY, DAYS.SATURDAY];
    return {
      day: daysMap[day],
    };
  }

  private getDateTimeTool() {
    return tool(() => this.getDateTime(), {
      name: 'getDateTime',
      description:
        'Get current day in format YYYY-MM-DD and time in format hh:mm:ss',
      responseFormat: 'content',
      schema: z.object({}),
    });
  }

  private getDayTool() {
    return tool(() => this.getDay(), {
      name: 'getDay',
      description: 'Get current day like Monday / Tuesaday / Wednesday',
      responseFormat: 'content',
      schema: z.object({}),
    });
  }

  private getDateTool() {
    return tool(() => this.getDate(), {
      name: 'getDate',
      description: 'Get current date in format YYYY-MM-DD',
      responseFormat: 'content',
      schema: z.object({}),
    });
  }

  private getTimeTool() {
    return tool(() => this.getTime(), {
      name: 'getTime',
      description: 'Get current time in format HH:mm:ss',
      responseFormat: 'content',
      schema: z.object({}),
    });
  }

  getAllTools() {
    const dayTool = this.getDayTool();
    const timeTool = this.getTimeTool();
    const dateTool = this.getDateTool();
    const dateTime = this.getDateTimeTool();
    return [dayTool, timeTool, dateTime, dateTool] as const;
  }
}

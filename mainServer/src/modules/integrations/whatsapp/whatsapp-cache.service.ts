import { Injectable, Logger } from '@nestjs/common';
import { WAMessage } from '@whiskeysockets/baileys';

@Injectable()
export class WhatsAppCacheService {
  private readonly logger = new Logger(WhatsAppCacheService.name);
  private readonly messageCache = new Map<string, WAMessage>();

  public getMessage(id: string): WAMessage | undefined {
    return this.messageCache.get(id) || undefined;
  }

  public saveMessage(id: string, message: WAMessage): void {
    this.messageCache.set(id, message);
  }
}

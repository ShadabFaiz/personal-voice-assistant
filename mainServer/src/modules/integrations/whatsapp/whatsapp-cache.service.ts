import { Injectable } from '@nestjs/common';
import { WAMessage, WAMessageKey } from '@whiskeysockets/baileys';

@Injectable()
export class WhatsAppCacheService {
  private readonly messageCache = new Map<NonNullable<WAMessageKey['id']>, WAMessage>();

  public getMessage(id: NonNullable<WAMessageKey['id']>): WAMessage | undefined {
    return this.messageCache.get(id) || undefined;
  }

  public saveMessage(id: NonNullable<WAMessageKey['id']>, message: WAMessage): void {
    this.messageCache.set(id, message);
  }
}

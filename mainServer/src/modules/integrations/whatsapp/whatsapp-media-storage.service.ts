import { AppDataDirectoryService } from '@core/services/appDirectory.service';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_AGENT_WORKSPACE_DIRECTORY_NAME } from '../../core/config/constants';
import { Injectable, Logger } from '@nestjs/common';
import { WAMessage, downloadMediaMessage } from '@whiskeysockets/baileys';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { WhatsAppService } from './whatsapp.service';

@Injectable()
export class WhatsAppMediaStorageService {
  private readonly logger = new Logger(WhatsAppMediaStorageService.name);

  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly appDataDirectoryService: AppDataDirectoryService,
    private readonly configService: ConfigService,
  ) {}

  async downloadAndSaveMedia(m: WAMessage): Promise<string | undefined> {
    try {
      const buffer = await downloadMediaMessage(
        m,
        'buffer',
        {},
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          logger: this.logger as any,
          reuploadRequest: this.whatsAppService.sock.updateMediaMessage,
        },
      );

      const dateObj = new Date();
      const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;

      let filenameStr = `${m.key.id}`;
      if (m.message?.documentMessage?.fileName) {
        filenameStr = m.message.documentMessage.fileName;
      } else if (m.message?.imageMessage) {
        filenameStr += '.jpeg';
      } else if (m.message?.videoMessage) {
        filenameStr += '.mp4';
      } else if (m.message?.audioMessage) {
        filenameStr += '.ogg';
      }

      const remoteJid = m.key.remoteJidAlt?.split('@')[0] ?? 'Unknown';
      const sender = m.pushName ? `${m.pushName}_${remoteJid}` : remoteJid;

      const folderName = path.join(
        this.appDataDirectoryService.getAppDataPath(),
        this.configService.get<string>('AGENT_WORKSPACE_DIRECTORY_NAME')!,
        'media',
        'whatsapp',
        sender,
        dateStr,
      );

      await fs.mkdir(folderName, { recursive: true });

      const filename = path.join(folderName, filenameStr);
      await fs.writeFile(filename, buffer);

      this.logger.log(`Successfully saved media to ${filename}`);

      return path.join('/', 'media', 'whatsapp', sender, dateStr, filenameStr);
    } catch (err) {
      this.logger.error('Failed to download media', err);
      return undefined;
    }
  }
}

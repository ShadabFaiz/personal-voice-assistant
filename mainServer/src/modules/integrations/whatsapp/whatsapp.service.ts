import { AppDataDirectoryService } from '@core/services/appDirectory.service';
import { Boom } from '@hapi/boom';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  useMultiFileAuthState,
  WAMessageKey,
} from '@whiskeysockets/baileys';
import * as path from 'node:path';
import * as QRCode from 'qrcode';
import { WhatsAppCacheService } from './whatsapp-cache.service';

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppService.name);
  public sock: ReturnType<typeof makeWASocket>;
  private shouldExit = false;

  constructor(
    private readonly appDataDirectoryService: AppDataDirectoryService,
    private readonly whatsAppCacheService: WhatsAppCacheService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing WhatsApp Service...');
    await this.connectToWhatsApp();
  }

  onModuleDestroy() {
    this.logger.log('Shutting down WhatsApp Service...');
    this.shouldExit = true;
    if (this.sock) {
      void this.sock.ws.close();
    }
  }

  private async connectToWhatsApp() {
    const credentialsPath = path.join(
      this.appDataDirectoryService.getAppDataPath(),
      'credentials',
      'whatsapp',
    );

    this.logger.debug(`Storing WhatsApp credentials at: ${credentialsPath}`);
    const { state, saveCreds } = await useMultiFileAuthState(credentialsPath);

    this.sock = makeWASocket({
      retryRequestDelayMs: 3000,
      auth: state,
      shouldSyncHistoryMessage: () => true,
      syncFullHistory: false,
      fireInitQueries: true,
      generateHighQualityLinkPreview: true,
      enableAutoSessionRecreation: true,
      enableRecentMessageCache: true,
      getMessage: (key: WAMessageKey) => {
        const message =
          this.whatsAppCacheService.getMessage(key.id!)?.message ?? undefined;
        return Promise.resolve(message);
      },
    });

    this.sock.ev.on('connection.update', (update) => {
      void this.handleConnectionUpdate(update);
    });

    this.sock.ev.on('creds.update', () => {
      void saveCreds();
    });
  }

  private async handleConnectionUpdate(
    update: Partial<ConnectionState>,
  ): Promise<void> {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        const qrcode = await QRCode.toString(qr, {
          type: 'terminal',
          small: true,
        });
        this.logger.log(`\n${qrcode}`);
      } catch (err) {
        this.logger.error('Failed to generate QR code', err);
      }
    }

    if (connection === 'close') {
      const loggedOutStatusCode: number = DisconnectReason.loggedOut;
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        loggedOutStatusCode;

      if (!this.shouldExit) {
        this.logger.warn('Connection closed.', lastDisconnect?.error);
        if (shouldReconnect) {
          this.logger.log('Reconnecting...');
          await this.connectToWhatsApp();
        }
      }
    } else if (connection === 'open') {
      this.logger.log('WhatsApp connection opened successfully.');
    }
  }

  public async sendMessage(jid: string, text: string) {
    if (!this.sock) throw new Error('Socket not initialized');
    await this.sock.sendMessage(jid, { text });
  }

  public async simulateTyping(jid: string, isTyping: boolean) {
    if (!this.sock) return;
    try {
      await this.sock.sendPresenceUpdate(
        isTyping ? 'composing' : 'paused',
        jid,
      );
    } catch (err) {
      this.logger.debug('Failed to send presence update', err);
    }
  }
}

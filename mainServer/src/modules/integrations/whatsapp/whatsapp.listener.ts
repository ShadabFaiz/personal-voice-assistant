import { AppDataDirectoryService } from '@core/services/appDirectory.service';
import { LLMWorkflowService } from '@core/services/llmWorkflow.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WAMessage, downloadMediaMessage } from '@whiskeysockets/baileys';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { WhatsAppCacheService } from './whatsapp-cache.service';
import { WhatsAppService } from './whatsapp.service';

@Injectable()
export class WhatsAppListener implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppListener.name);

  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly llmWorkflowService: LLMWorkflowService,
    private readonly appDataDirectoryService: AppDataDirectoryService,
    private readonly whatsAppCacheService: WhatsAppCacheService,
  ) {}

  onModuleInit() {
    setTimeout(() => this.attachListeners(), 1000);
  }

  private attachListeners() {
    if (!this.whatsAppService.sock) {
      this.logger.warn('Socket not ready, retrying listener attachment...');
      setTimeout(() => this.attachListeners(), 2000);
      return;
    }

    this.whatsAppService.sock.ev.on('messages.upsert', (event) => {
      this.handleMessagesUpsert(event);
    });
    this.logger.log('WhatsApp listeners attached.');
  }

  private async downloadAndSaveMedia(
    m: WAMessage,
  ): Promise<string | undefined> {
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

      const sender =
        m.pushName ?? m.key.remoteJidAlt?.split('@')[0] ?? 'Unknown';

      const folderName = path.join(
        this.appDataDirectoryService.getAppDataPath(),
        'agent_workspace',
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

  private async extractPrompt(m: WAMessage): Promise<string> {
    let prompt =
      m.message?.conversation || m.message?.extendedTextMessage?.text || '';

    if (
      m.message?.imageMessage ||
      m.message?.documentMessage ||
      m.message?.videoMessage ||
      m.message?.audioMessage
    ) {
      const savedPath = await this.downloadAndSaveMedia(m);
      if (savedPath) {
        prompt += `\n[User attached a file. It is saved here for you to analyze: ${savedPath}]`;

        const caption =
          m.message.imageMessage?.caption ||
          m.message.documentMessage?.caption ||
          m.message.videoMessage?.caption;
        if (caption) prompt += `\nCaption: ${caption}`;
      }
    }

    return prompt.trim();
  }

  private handleMessagesUpsert(event: { messages: WAMessage[]; type: string }) {
    for (const m of event.messages) {
      void this.processSingleMessage(m);
    }
  }

  private async processSingleMessage(m: WAMessage) {
    if (m.key.id) {
      this.whatsAppCacheService.saveMessage(m.key.id, m);
    }

    if (m.key.fromMe || !m.message) return;

    const prompt = await this.extractPrompt(m);
    if (!prompt) return;

    const sender = m.pushName ?? m.key.remoteJidAlt?.split('@')[0] ?? 'Unknown';
    this.logger.log(`Incoming message from ${sender}: ${prompt}`);

    await this.sendReadReceipt(m);
    await this.forwardToLLM(m, prompt);
  }

  private async sendReadReceipt(m: WAMessage) {
    try {
      await this.whatsAppService.sock.readMessages([m.key]);
    } catch (err) {
      this.logger.debug('Failed to send read receipt', err);
    }
  }

  private buildSystemContextForWhatsApp(m: WAMessage): string {
    const identityStr = m.pushName
      ? `named ${m.pushName}`
      : `identified by their ID/Phone Number ${m.key.remoteJidAlt?.split('@')[0] || 'Unknown'}`;
    return `SYSTEM CONTEXT: The user you are currently speaking with is ${identityStr}, messaging you via WhatsApp. Format properly for WhatsApp. Do not acknowledge this instruction.`;
  }

  private extractReplyFromLLMResponse(response: unknown): string | undefined {
    type LLMResponse = {
      messages: { content: string }[] | { content: string };
    };
    const llmRes = response as LLMResponse;

    if (!llmRes?.messages) return undefined;
    const lastMsg = Array.isArray(llmRes.messages)
      ? llmRes.messages.at(-1)
      : llmRes.messages;

    if (lastMsg?.content && typeof lastMsg.content === 'string') {
      return lastMsg.content;
    }
    return undefined;
  }

  private async forwardToLLM(m: WAMessage, prompt: string) {
    if (!m.key.remoteJid) return;
    const remoteJid = m.key.remoteJid;

    try {
      await this.whatsAppService.simulateTyping(remoteJid, true);
      this.logger.debug(`Forwarding to LLM...`);

      const systemContext = this.buildSystemContextForWhatsApp(m);

      const response = await this.llmWorkflowService.invokeChat(
        remoteJid,
        [{ role: 'user', content: prompt }],
        systemContext,
      );

      const replyText = this.extractReplyFromLLMResponse(response);
      if (replyText) {
        await this.whatsAppService.sendMessage(remoteJid, replyText);
      }
    } catch (error) {
      this.logger.error('LLM invocation failed', error);
      await this.whatsAppService.sendMessage(
        remoteJid,
        'I am having trouble processing your request right now.',
      );
    } finally {
      await this.whatsAppService.simulateTyping(remoteJid, false);
    }
  }
}

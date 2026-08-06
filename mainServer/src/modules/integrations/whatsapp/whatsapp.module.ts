import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppListener } from './whatsapp.listener';
import { WhatsAppCacheService } from './whatsapp-cache.service';
import { WhatsAppMediaStorageService } from './whatsapp-media-storage.service';
import { CoreModule } from '@core/core.module';

@Module({
  imports: [CoreModule],
  providers: [WhatsAppService, WhatsAppListener, WhatsAppCacheService, WhatsAppMediaStorageService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

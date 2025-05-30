import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HelperService {
  private readonly logger = new Logger(HelperService.name);

  constructor(private readonly httpService: HttpService) {}

  async checkOllamaStatus(baseUrl: string): Promise<boolean> {
    try {
      const tagsUrl = `${baseUrl}/api/tags`;
      this.logger.log(`Checking if Ollama is running at ${tagsUrl}`);
      const response = await lastValueFrom(this.httpService.get(tagsUrl, { 'timeout': 5000 }));
      if (response.status === 200) {
        this.logger.log('Ollama is live.');
        return true;
      } else {
        this.logger.error(
          `Ollama service check failed with status: ${response.status}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error('Ollama service is not live.', error.message);
      return false;
    }
  }
}

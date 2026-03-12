import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HelperService {
  private readonly logger = new Logger(HelperService.name);

  constructor(private readonly httpService: HttpService) {}

  async checkOllamaStatus(baseUrl: string): Promise<boolean> {
    const spinner = ['\\', '|', '/', '-'];
    let i = 0;
    const interval: NodeJS.Timeout | null = null;
    try {
      const tagsUrl = `${baseUrl}/api/tags`;
      this.logger.log(`Checking if Ollama is running at ${tagsUrl}`);
      const interval = setInterval(() => {
        process.stdout.write(`\rChecking Ollama status... ${spinner[i]}`);
        i = (i + 1) % spinner.length;
      }, 100);
      const response = await lastValueFrom(
        this.httpService.get(tagsUrl, { timeout: 5000 }),
      );
      if (interval) {
        clearInterval(interval);
      }
      process.stdout.write('\r');
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
      if (interval) {
        clearInterval(interval);
      }
      process.stdout.write('\r'); // Clear the spinner
      this.logger.error(
        'Ollama service is not live.',
        (error as Error).message,
      );
      return false;
    }
  }
}

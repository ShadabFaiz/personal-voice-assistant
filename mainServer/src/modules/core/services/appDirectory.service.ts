import { APP_DATA_DIRECTORY_NAME } from '@core/config/constants';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import os from 'node:os';
import path from 'node:path';

export class AppDataDirectoryService {
  private readonly logger = new Logger(AppDataDirectoryService.name);

  constructor(private readonly configService: ConfigService) {}

  getAppDataPath(): string {
    const homeDir = os.homedir();
    this.logger.log(`homeDir: ${homeDir}`);
    switch (process.platform) {
      case 'win32':
        return path.join(
          process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'),
          APP_DATA_DIRECTORY_NAME,
        );

      case 'darwin':
        return path.join(
          homeDir,
          'Library',
          'Application Support',
          APP_DATA_DIRECTORY_NAME,
        );

      default:
        // Linux and others
        return path.join(
          process.env.XDG_DATA_HOME || path.join(homeDir, '.local', 'share'),
          APP_DATA_DIRECTORY_NAME,
        );
    }
  }
}

import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, AppConfigFunction } from './config/configuration';
import { LLMWorkflowService } from './services/llmWorkflow.service';
import { SystemPromptsService } from './services/systemPrompts.service';
import { BraveSearchTool } from './tools/braveSearchTool/brave-search.tool';
import { DuckDuckGoWebSearchTool } from './tools/duckDuckGoSearchTool/duck-duck-go-search.tool';
import { CliTool } from './tools/cliTool/cli.tool';
import { DateTimeTool } from './tools/dateTimeTools/dateTime.tool';
import { LocationTool } from './tools/locationTool/location.tool';
import { ToolsService } from './tools/tools.service';
import { WeatherTool } from './tools/weatherTool/weather.tool';
import { WebPageFetcherTool } from './tools/webPageFetcherTool/web-page-fetcher.tool';
import { HttpModule } from '@nestjs/axios';
import https from 'node:https';
import { loadCertificate } from './loadCertificate';
import tls from 'node:tls';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfigFunction],
    }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const caPath = configService.get<string>('CUSTOM_CA_CERT_PATH');

        let httpsAgent: https.Agent | undefined;
        Logger.debug(`CUSTOM_CA_CERT_PATH:${caPath}`);

        if (caPath) {
          Logger.debug(`Using CUSTOM_CA_CERT_PATH`);
          const [error, cert] = loadCertificate(caPath);
          if (error) {
            throw error;
          }

          if (cert) {
            httpsAgent = new https.Agent({
              ca: [...tls.rootCertificates, cert],
            });
          }
        }

        return {
          httpsAgent,
          timeout: 10000,
          maxRedirects: 5,
        };
      },
    }),
  ],
  providers: [
    LLMWorkflowService,
    SystemPromptsService,
    {
      provide: DateTimeTool,
      useClass: DateTimeTool,
    },
    {
      provide: WeatherTool,
      useClass: WeatherTool,
    },
    {
      provide: CliTool,
      useClass: CliTool,
    },
    {
      provide: BraveSearchTool,
      useClass: BraveSearchTool,
    },
    {
      provide: DuckDuckGoWebSearchTool,
      useClass: DuckDuckGoWebSearchTool,
    },
    {
      provide: LocationTool,
      useClass: LocationTool,
    },
    {
      provide: ToolsService,
      useClass: ToolsService,
    },
    {
      provide: WebPageFetcherTool,
      useClass: WebPageFetcherTool,
    },
  ],
  exports: [
    LLMWorkflowService,
    SystemPromptsService,
    DateTimeTool,
    WeatherTool,
    CliTool,
    BraveSearchTool,
    DuckDuckGoWebSearchTool,
    LocationTool,
    ToolsService,
    WebPageFetcherTool,
  ],
})
export class CoreModule {}

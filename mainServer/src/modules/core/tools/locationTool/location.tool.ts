import { tool } from '@langchain/core/tools';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { LocationData } from './interface';

@Injectable()
export class LocationTool {
  private readonly logger = new Logger(LocationTool.name);
  private locationData: LocationData | null = null;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  private getCurrentLocationData(): LocationData {
    this.logger.log('Retrieving location data from environment');

    if (this.locationData) {
      this.logger.log('Responding with cached location data');
      return this.locationData;
    }

    const locationData: LocationData = {
      version: '',
      city: this.configService.get<string>('LOCATION_CITY') || '',
      region: this.configService.get<string>('LOCATION_REGION') || '',
      region_code: this.configService.get<string>('LOCATION_REGION_CODE') || '',
      country: this.configService.get<string>('LOCATION_COUNTRY') || '',
      country_name:
        this.configService.get<string>('LOCATION_COUNTRY_NAME') || '',
      country_code:
        this.configService.get<string>('LOCATION_COUNTRY_CODE') || '',
      country_code_iso3:
        this.configService.get<string>('LOCATION_COUNTRY_CODE_ISO3') || '',
      country_capital:
        this.configService.get<string>('LOCATION_COUNTRY_CAPITAL') || '',
      country_tld: this.configService.get<string>('LOCATION_COUNTRY_TLD') || '',
      continent_code:
        this.configService.get<string>('LOCATION_CONTINENT_CODE') || '',
      in_eu: this.configService.get<boolean>('LOCATION_IN_EU') || false,
      postal: this.configService.get<string>('LOCATION_POSTAL') || '',
      latitude: this.configService.get<number>('LOCATION_LATITUDE') || 0,
      longitude: this.configService.get<number>('LOCATION_LONGITUDE') || 0,
      timezone: this.configService.get<string>('LOCATION_TIMEZONE') || '',
      utc_offset: this.configService.get<string>('LOCATION_UTC_OFFSET') || '',
      country_calling_code:
        this.configService.get<string>('LOCATION_COUNTRY_CALLING_CODE') || '',
      currency: this.configService.get<string>('LOCATION_CURRENCY') || '',
      currency_name:
        this.configService.get<string>('LOCATION_CURRENCY_NAME') || '',
      languages: this.configService.get<string>('LOCATION_LANGUAGES') || '',
      country_area:
        this.configService.get<number>('LOCATION_COUNTRY_AREA') || 0,
      country_population:
        this.configService.get<number>('LOCATION_COUNTRY_POPULATION') || 0,
      asn: this.configService.get<string>('LOCATION_ASN') || '',
      org: this.configService.get<string>('LOCATION_ORG') || '',
    };

    if (!locationData.city || !locationData.country_name) {
      this.logger.error('Required location environment variables are not set');
      throw new Error(
        'Required location environment variables (LOCATION_CITY, LOCATION_COUNTRY_NAME) are not set',
      );
    }

    this.logger.log(
      `Successfully retrieved location data for: ${locationData.city}, ${locationData.country_name}`,
    );

    this.locationData = locationData;
    return this.locationData;
  }

  private formatLocationData(location: LocationData): string {
    return `Current Location:
- City: ${location.city}
- Region: ${location.region} (${location.region_code})
- Country: ${location.country_name} (${location.country_code})
- Continent: ${location.continent_code}
- Postal Code: ${location.postal}
- Coordinates: ${location.latitude}, ${location.longitude}
- Timezone: ${location.timezone} (UTC${location.utc_offset})
- Currency: ${location.currency_name} (${location.currency})
- Calling Code: ${location.country_calling_code}
- Capital: ${location.country_capital}
- Languages: ${location.languages}
- EU Member: ${location.in_eu}
- Country Area: ${location.country_area} sq km
- Population: ${location.country_population}
- ASN: ${location.asn}
- Organization: ${location.org}`;
  }

  private getCurrentLocationTool() {
    return tool(
      () => {
        const location = this.getCurrentLocationData();
        return this.formatLocationData(location);
      },
      {
        name: 'get_current_location',
        description:
          'Get the current location information based on IP address including city, region, country, timezone, and other geographical details',
        responseFormat: 'content',
        schema: z.object({}),
      },
    );
  }

  getAllTools() {
    return [this.getCurrentLocationTool()] as const;
  }
}

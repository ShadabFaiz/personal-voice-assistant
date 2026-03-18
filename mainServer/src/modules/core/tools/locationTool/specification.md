# LOCATION TOOL SPECIFICATION

## Purpose

This document defines specification for location tool used by the AI agent.

The goal is to provide the LLM with geographical location information based on the server's IP address, including city, region, country, timezone, and other relevant geographical details.

---

# 1. LOCATION DATA SOURCE

Location data is provided through **environment variables** configured in the application.

The tool does not make external API calls at runtime. All location information is pre-configured and cached.

### Environment Variable Prefix

All location-related environment variables use the following prefix:

```
LOCATION_
```

---

# 2. LOCATION TOOL

The LocationTool provides a single tool for retrieving current location information.

**Tool Name**

```
get_current_location
```

### Parameters

```
None
```

### Caching Behavior

Location data is cached after the first retrieval. Subsequent calls return cached data without re-reading environment variables.

---

# 3. TOOL DEFINITION

## GET CURRENT LOCATION

Returns comprehensive geographical location information.

**Tool Name**

```
get_current_location
```

### Parameters

```
None
```

### Response Format

The response is formatted as a human-readable string with the following structure:

```
Current Location:
- City: [city]
- Region: [region] ([region_code])
- Country: [country_name] ([country_code])
- Continent: [continent_code]
- Postal Code: [postal]
- Coordinates: [latitude], [longitude]
- Timezone: [timezone] (UTC[utc_offset])
- Currency: [currency_name] ([currency])
- Calling Code: [country_calling_code]
- Capital: [country_capital]
- Languages: [languages]
- EU Member: [in_eu]
- Country Area: [country_area] sq km
- Population: [country_population]
- ASN: [asn]
- Organization: [org]
```

### Example

Request:

```
get_current_location()
```

Response:

```
Current Location:
- City: Patna
- Region: Bihar (DL)
- Country: India (IN)
- Continent: AS
- Postal Code: 110098
- Coordinates: 28.62137, 77.2148
- Timezone: Asia/Kolkata (UTC+0530)
- Currency: Rupee (INR)
- Calling Code: +91
- Capital: Patna
- Languages: en-IN,hi,bn,te,mr,ta,ur,gu,kn,ml,or,pa,as,bh,sat,ks,ne,sd,kok,doi,mni,sit,sa,fr,lus,inc
- EU Member: false
- Country Area: 3287590 sq km
- Population: 1352617328
- ASN: AS53813
- Organization: ZSCALER, INC.
```

+++++++ REPLACE

---

# 4. LOCATION DATA FIELDS

The tool returns the following location fields:

### Basic Location

| Field               | Type   | Description                                      |
| ------------------- | ------ | ------------------------------------------------ |
| `city`              | string | City name                                        |
| `region`            | string | State or region name                             |
| `region_code`       | string | State or region code (e.g., CA, NY)              |
| `country_name`      | string | Full country name                                |
| `country_code`      | string | ISO 3166-1 alpha-2 country code (e.g., US, GB)   |
| `country_code_iso3` | string | ISO 3166-1 alpha-3 country code (e.g., USA, GBR) |
| `country_capital`   | string | Capital city of the country                      |
| `country_tld`       | string | Top-level domain (e.g., .com, .uk)               |
| `continent_code`    | string | Continent code (e.g., NA, EU, AS)                |

### Positional

| Field       | Type   | Description                  |
| ----------- | ------ | ---------------------------- |
| `latitude`  | number | Latitude in decimal degrees  |
| `longitude` | number | Longitude in decimal degrees |
| `postal`    | string | Postal/ZIP code              |

### Timezone

| Field        | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| `timezone`   | string | Timezone name (e.g., America/New_York) |
| `utc_offset` | string | UTC offset (e.g., -05:00, +01:00)      |

### Currency

| Field           | Type   | Description                          |
| --------------- | ------ | ------------------------------------ |
| `currency`      | string | Currency code (e.g., USD, EUR)       |
| `currency_name` | string | Full currency name (e.g., US Dollar) |

### Communication

| Field                  | Type   | Description                                |
| ---------------------- | ------ | ------------------------------------------ |
| `country_calling_code` | string | International calling code (e.g., +1, +44) |
| `languages`            | string | Comma-separated language codes             |

### Country Statistics

| Field                | Type    | Description                       |
| -------------------- | ------- | --------------------------------- |
| `in_eu`              | boolean | Whether country is EU member      |
| `country_area`       | number  | Country area in square kilometers |
| `country_population` | number  | Country population                |

### Network

| Field | Type   | Description              |
| ----- | ------ | ------------------------ |
| `asn` | string | Autonomous System Number |
| `org` | string | Organization name        |

### Metadata

| Field     | Type   | Description                                    |
| --------- | ------ | ---------------------------------------------- |
| `version` | string | API version (empty string for configured data) |

---

# 5. ENVIRONMENT VARIABLES

All location data is loaded from environment variables with the following naming convention:

### Required Variables

| Variable                | Type   | Description  |
| ----------------------- | ------ | ------------ |
| `LOCATION_CITY`         | string | City name    |
| `LOCATION_COUNTRY_NAME` | string | Country name |

### Optional Variables

| Variable                        | Type    | Default | Description       |
| ------------------------------- | ------- | ------- | ----------------- |
| `LOCATION_VERSION`              | string  | `""`    | API version       |
| `LOCATION_REGION`               | string  | `""`    | Region name       |
| `LOCATION_REGION_CODE`          | string  | `""`    | Region code       |
| `LOCATION_COUNTRY`              | string  | `""`    | Country code      |
| `LOCATION_COUNTRY_CODE`         | string  | `""`    | Country code      |
| `LOCATION_COUNTRY_CODE_ISO3`    | string  | `""`    | ISO3 country code |
| `LOCATION_COUNTRY_CAPITAL`      | string  | `""`    | Capital city      |
| `LOCATION_COUNTRY_TLD`          | string  | `""`    | Top-level domain  |
| `LOCATION_CONTINENT_CODE`       | string  | `""`    | Continent code    |
| `LOCATION_IN_EU`                | boolean | `false` | EU member status  |
| `LOCATION_POSTAL`               | string  | `""`    | Postal code       |
| `LOCATION_LATITUDE`             | number  | `0`     | Latitude          |
| `LOCATION_LONGITUDE`            | number  | `0`     | Longitude         |
| `LOCATION_TIMEZONE`             | string  | `""`    | Timezone          |
| `LOCATION_UTC_OFFSET`           | string  | `""`    | UTC offset        |
| `LOCATION_COUNTRY_CALLING_CODE` | string  | `""`    | Calling code      |
| `LOCATION_CURRENCY`             | string  | `""`    | Currency code     |
| `LOCATION_CURRENCY_NAME`        | string  | `""`    | Currency name     |
| `LOCATION_LANGUAGES`            | string  | `""`    | Languages         |
| `LOCATION_COUNTRY_AREA`         | number  | `0`     | Country area      |
| `LOCATION_COUNTRY_POPULATION`   | number  | `0`     | Population        |
| `LOCATION_ASN`                  | string  | `""`    | ASN               |
| `LOCATION_ORG`                  | string  | `""`    | Organization      |

---

# 6. TOOL EXECUTION FLOW

The tool follows this execution pattern:

1. Check if location data is cached
2. If cached, return cached data
3. If not cached:
   - Load all location environment variables
   - Validate required variables (city, country_name)
   - Cache the location data
4. Format location data into a human-readable string
5. Return formatted response

### Caching Logic

```javascript
if (this.locationData) {
  return this.locationData;
}

// Load and cache location data
this.locationData = locationData;
```

---

# 7. RESPONSE FORMAT

The tool returns a formatted string with bullet points for each field.

### Format Characteristics

1. **Header**: "Current Location:" on first line
2. **Bullet points**: Each field on a separate line with "- " prefix
3. **Field labels**: Descriptive labels (e.g., "City:", "Region:")
4. **Value format**: Values are displayed in natural format
5. **Parenthetical codes**: Codes often displayed in parentheses (e.g., "(CA)", "(US)")

---

# 8. ERROR HANDLING

### Missing Required Variables

If required environment variables are not set, the tool throws an error:

```
Error: Required location environment variables (LOCATION_CITY, LOCATION_COUNTRY_NAME) are not set
```

### Error Behavior

- Errors are thrown synchronously
- No error recovery is implemented
- The tool does not use graceful defaults for required fields

### Logging

The tool logs the following events:

- Location retrieval attempt
- Cache hit (returning cached data)
- Successful location data retrieval with city and country

---

# 9. CONFIGURATION

### NestJS Config Service

The tool uses NestJS ConfigService to access environment variables:

```javascript
this.configService.get < string > 'LOCATION_CITY';
this.configService.get < boolean > 'LOCATION_IN_EU';
this.configService.get < number > 'LOCATION_LATITUDE';
```

+++++++ REPLACE

### Type Safety

Each environment variable is typed appropriately:

- Strings: `get<string>()`
- Booleans: `get<boolean>()`
- Numbers: `get<number>()`

---

# 10. FUTURE EXTENSIONS

Possible future extensions:

```
get_weather - Get current weather for location
get_time - Get current local time for location
get_nearby_cities - Get nearby cities
get_timezone_info - Get detailed timezone information
get_location_by_ip - Accept IP address parameter
get_location_history - Track location changes
```

All future extensions must maintain the same response format pattern and caching behavior.

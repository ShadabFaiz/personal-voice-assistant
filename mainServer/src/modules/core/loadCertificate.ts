import { Logger } from '@nestjs/common';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

export const loadCertificate = (
  caPath: string,
): [Error, null] | [null, string] => {
  let cert: string;

  try {
    execSync(`openssl x509 -in ${caPath} -noout`);
    cert = fs.readFileSync(caPath, 'utf8');
    if (!cert.includes('-----BEGIN CERTIFICATE-----')) {
      throw new Error(
        `[TLS CONFIG ERROR] Certificate is not PEM format: ${caPath}`,
      );
    }
    Logger.debug('CUSTOM_CA_CERT_PATH read successfully');
  } catch (err) {
    const error = new Error(
      `[TLS CONFIG ERROR] Failed to read certificate at ${caPath}. ${
        err instanceof Error ? err.message : err
      }`,
    );
    return [error, null];
  }

  return [null, cert];
};

import {
  DEFAULT_USER_AGENT,
  DEFAULT_ACCEPT,
  DEFAULT_ACCEPT_LANGUAGE,
} from '../constants/defaultHeaders';

export function buildRequestHeaders(
  customHeaders?: Record<string, string>,
): Record<string, string> {
  return {
    'User-Agent': customHeaders?.['User-Agent'] || DEFAULT_USER_AGENT,
    Accept: customHeaders?.['Accept'] || DEFAULT_ACCEPT,
    'Accept-Language':
      customHeaders?.['Accept-Language'] || DEFAULT_ACCEPT_LANGUAGE,
    ...customHeaders,
  };
}

import {
  CreateRandomTempEmailResponse,
  CreateTempEmailResponse,
  GetInboxResponse,
  LoginWithIdAndPasswordResponse,
  ReadEmailResponse,
} from './operations/interface';

export enum TempMailOperation {
  CREATE_TEMP_EMAIL = 'createTempEmail',
  CREATE_RANDOM_TEMP_EMAIL_ACCOUNT = 'createRandomTempEmailAccount',
  GET_INBOX = 'getInbox',
  READ_EMAIL = 'readEmail',
  LOGIN_WITH_ID_AND_PASSWORD = 'loginWithIdAndPassword',
}

export interface TempMailToolParams {
  operation: TempMailOperation;
  emailId?: string;
  password?: string;
}

export interface GenericResponse {
  status: boolean;
  operation: TempMailOperation;
  error?: string;
}

export type TempMailToolResponse =
  | GenericResponse
  | CreateTempEmailResponse
  | CreateRandomTempEmailResponse
  | GetInboxResponse
  | LoginWithIdAndPasswordResponse
  | ReadEmailResponse;

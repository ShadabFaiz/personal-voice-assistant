export interface GetInboxParams {
  emailId?: string;
  password?: string;
}

export interface GetInboxResponse {
  status: boolean;
  operation: string;
  data?: string;
}

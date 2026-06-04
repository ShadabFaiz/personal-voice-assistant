export interface CreateTempEmailParams {
  emailId?: string;
  password?: string;
}

export interface CreateTempEmailResponse {
  status: boolean;
  operation: string;
  data?: string;
}

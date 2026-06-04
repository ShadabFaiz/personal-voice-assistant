export interface ReadEmailParams {
  emailId?: string;
}

export interface ReadEmailResponse {
  status: boolean;
  operation: string;
  data?: string;
}

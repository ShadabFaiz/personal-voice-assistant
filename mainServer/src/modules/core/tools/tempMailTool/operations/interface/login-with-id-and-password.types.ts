export interface LoginWithIdAndPasswordParams {
  emailId: string;
  password: string;
}

export interface LoginResultData {
  token: string;
  id: string;
}

export interface LoginWithIdAndPasswordResponse {
  status: boolean;
  operation: string;
  data: LoginResultData;
}

export interface CreateRandomTempEmailResponse {
  status: boolean;
  operation: string;
  data?: { username: string; password: string };
  message?: string;
}

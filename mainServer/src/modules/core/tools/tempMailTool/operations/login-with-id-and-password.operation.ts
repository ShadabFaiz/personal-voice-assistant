import Mailjs from '@cemalgnlts/mailjs';
import { Logger } from '@nestjs/common';
import { TempMailOperation } from '../temp-mail-tool.types';
import { ITempMailOperation } from './base.operation';
import {
  LoginWithIdAndPasswordParams,
  LoginWithIdAndPasswordResponse,
} from './interface/login-with-id-and-password.types';

export class LoginWithIdAndPasswordOperation implements ITempMailOperation<
  LoginWithIdAndPasswordParams,
  LoginWithIdAndPasswordResponse
> {
  private readonly logger = new Logger(LoginWithIdAndPasswordOperation.name);

  constructor(private readonly mailJs: Mailjs) {}

  async execute(
    params: LoginWithIdAndPasswordParams,
  ): Promise<LoginWithIdAndPasswordResponse> {
    this.validateParams(params);
    this.logger.log('Executing loginWithIdAndPassword operation: ', { params });
    const response = await this.mailJs.login(params.emailId, params.password);
    this.logger.log('TempEmail login response: ', { response });
    return {
      status: true,
      operation: TempMailOperation.LOGIN_WITH_ID_AND_PASSWORD,
      data: response.data,
    };
  }

  private validateParams(params: LoginWithIdAndPasswordParams): void {
    if (!params.emailId || params.emailId.trim() === '') {
      throw new Error(
        `emailId is required for loginWithIdAndPassword. Parameter received: ${JSON.stringify(params)}`,
      );
    }
    if (!params.password || params.password.trim() === '') {
      throw new Error(
        `password is required for loginWithIdAndPassword. Parameter received: ${JSON.stringify(params)}`,
      );
    }
  }
}

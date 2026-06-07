import Mailjs from '@cemalgnlts/mailjs';
import { Injectable, Logger } from '@nestjs/common';
import { TempMailOperation } from '../temp-mail-tool.types';
import { ITempMailOperation } from './base.operation';
import { CreateRandomTempEmailResponse } from './interface/create-random-temp-email.types';

@Injectable()
export class CreateRandomTempEmailAccountOperation implements ITempMailOperation<
  void,
  CreateRandomTempEmailResponse
> {
  private readonly logger = new Logger(
    CreateRandomTempEmailAccountOperation.name,
  );

  constructor(private readonly mailJs: Mailjs) {}

  async execute(): Promise<CreateRandomTempEmailResponse> {
    this.logger.log('Creating a random temp email account');
    try {
      const response = await this.mailJs.createOneAccount(true);
      this.logger.log('Account created: ');
      return {
        status: response.status,
        operation: TempMailOperation.CREATE_RANDOM_TEMP_EMAIL_ACCOUNT,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        status: false,
        operation: TempMailOperation.CREATE_RANDOM_TEMP_EMAIL_ACCOUNT,
        message: (error as Error).message,
      };
    }
  }
}

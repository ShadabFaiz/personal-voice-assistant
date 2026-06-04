import { Injectable, Logger } from '@nestjs/common';
import { TempMailOperation } from '../temp-mail-tool.types';
import { ITempMailOperation } from './base.operation';
import {
  CreateTempEmailParams,
  CreateTempEmailResponse,
} from './interface/create-temp-email.types';

@Injectable()
export class CreateTempEmailOperation implements ITempMailOperation<
  CreateTempEmailParams,
  CreateTempEmailResponse
> {
  private readonly logger = new Logger(CreateTempEmailOperation.name);

  async execute(
    _params: CreateTempEmailParams,
  ): Promise<CreateTempEmailResponse> {
    this.logger.log('Executing createTempEmail operation');
    return {
      status: true,
      operation: TempMailOperation.CREATE_TEMP_EMAIL,
      data: 'TempMail createTempEmail is not yet implemented. This is a dummy response.',
    };
  }
}

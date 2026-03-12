import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HelperService {
  private readonly logger = new Logger(HelperService.name);

  constructor(private readonly httpService: HttpService) {}
}

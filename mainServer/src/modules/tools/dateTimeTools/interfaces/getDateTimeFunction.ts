import { GetDateFunctionResponse } from './getDateFunction';
import { GetTimeFunctionResponse } from './getTimeFunction';

export interface GetDateTimeFunctionResponse {
  date: GetDateFunctionResponse;
  time: GetTimeFunctionResponse;
}

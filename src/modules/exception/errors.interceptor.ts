import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
const _ = require('lodash');

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(error => {
          const message = (_.get(error, 'message.message') && (_.get(error, 'message.message', []).map(msg => 
            Object.values(msg.constraints).join(', ')).join(', ')
          )) || _.get(error, 'message', 'Internal Server Error');
          return throwError(new HttpException(
            message,
            _.get(error, 'status', HttpStatus.INTERNAL_SERVER_ERROR)
          ))
        }),
      );
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { error } from "console";
import type { Request } from "express";
import { Observable, tap } from "rxjs";

@Injectable()
export class UploadLoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse();
        const startTime = Date.now();

        const method = request.method;
        const url = request.originalUrl;
        const ip = request.ip ?? 'unknown';

        console.log(`[UPLOAD] ${method} ${url} - IP: ${ip}`);

        return next.handle().pipe(
            tap({
                next: () => {
                    const duration = Date.now() - startTime;

                    console.log(`[UPLOAD] ${method} ${url} - ` + `Status: ${response.statusCode} - ` + `Duration: ${duration}ms`);
                }, error: (error) => {
                    const duration = Date.now() - startTime;
                    console.log(`[UPLOAD] ${method} ${url} - ` + `Status: ${error?.status ?? 500} - ` + `Duration: ${duration}ms`);
                }
            })
        )
    }
}
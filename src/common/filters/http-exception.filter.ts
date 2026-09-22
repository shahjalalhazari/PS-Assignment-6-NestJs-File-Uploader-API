import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const context = host.switchToHttp();
        const request = context.getRequest<Request>();
        const response = context.getResponse<Response>();
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();

            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseBody = exceptionResponse as {
                    message?: string | string[];
                    error?: string;
                };

                if (Array.isArray(responseBody.message)) {
                    message = responseBody.message.join(', ');
                } else if (responseBody.message) {
                    message = responseBody.message;
                }

                if (responseBody.error) error = responseBody.error;
            }
        }

        response.status(statusCode).json({
            statusCode,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        })
    }
}
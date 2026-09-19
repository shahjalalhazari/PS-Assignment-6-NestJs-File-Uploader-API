import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import type { Request } from "express";

interface RateLimitRecord {
    count: number;
    resetTime: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
    private readonly MAX_REQUESTS = 10;
    private readonly WINDOW_MS = 60 * 1000; // 1 MINUTE

    private readonly requests = new Map<string, RateLimitRecord>();

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        const ip = request.ip;      
        if (!ip) throw new HttpException(
            'Unable to determine client IP address.',
            HttpStatus.TOO_MANY_REQUESTS,
        );

        const now = Date.now();

        const record = this.requests.get(ip);
        if (!record) {
            this.requests.set(ip, {
                count: 1,
                resetTime: now + this.WINDOW_MS,
            });
            return true;
        }

        if (now >= record.resetTime) {
            this.requests.set(ip, {
                count: 1,
                resetTime: now + this.WINDOW_MS,
            });
            return true;
        }

        if (record.count >= this.MAX_REQUESTS) {
            throw new HttpException(
                'Too many upload requests. Please try again later.',
                HttpStatus.TOO_MANY_REQUESTS,
            )
        }

        record.count++;
        return true;
    }
}
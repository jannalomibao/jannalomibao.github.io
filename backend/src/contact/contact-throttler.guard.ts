import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import type { Response } from 'express';

// POST /api/contact is the one public write endpoint with no auth in front
// of it, so it's the one that gets its own rate limit — 5/IP/hour, per
// docs/07-api-contract.md §7.1. Only attached to that route, not global,
// so public reads and admin routes are unaffected.
@Injectable()
export class ContactThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(
    context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    const response = context.switchToHttp().getResponse<Response>();
    response.setHeader('Retry-After', String(Math.ceil(detail.ttl / 1000)));
    // @nestjs/throttler's default ThrottlerException body is missing the
    // `error` field the rest of this API's error responses always have
    // (docs/07-api-contract.md §2) — thrown explicitly here instead of
    // delegating to super(), to keep every error response the same shape.
    throw new HttpException(
      {
        statusCode: 429,
        message: 'Too many requests — try again later',
        error: 'Too Many Requests',
      },
      429,
    );
  }
}

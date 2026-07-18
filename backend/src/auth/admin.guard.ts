import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import jwksClient, { type JwksClient } from 'jwks-rsa';
import type { Request } from 'express';

interface SupabaseJwtPayload {
  sub: string;
  role?: string;
  exp: number;
}

// Stateless — no session stored in this backend (architecture doc §5). Every
// admin request carries its own bearer token, verified fresh each time.
// There is exactly one admin, checked by exact Supabase user id match, not a
// role/permission system (PRD non-goal: no multi-author support).
//
// Verification is JWKS-based (asymmetric ES256), not a shared HS256 secret —
// confirmed by actually decoding a real token issued by the local Supabase
// CLI stack rather than assuming the legacy shared-secret scheme still
// applies. jwks-rsa caches keys internally, so this doesn't hit the JWKS
// endpoint on every request.
@Injectable()
export class AdminGuard implements CanActivate {
  private client: JwksClient | null = null;

  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const adminUserId = this.config.getOrThrow<string>('ADMIN_USER_ID');

    let payload: SupabaseJwtPayload;
    try {
      const key = await this.getSigningKey(token);
      payload = jwt.verify(token, key, {
        algorithms: ['ES256'],
      }) as SupabaseJwtPayload;
    } catch {
      // Covers expired, malformed, bad-signature, and unknown-kid tokens
      // alike — none of these are the caller's business to distinguish
      // from "not logged in."
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.sub !== adminUserId) {
      throw new ForbiddenException('Not the site owner');
    }

    return true;
  }

  private async getSigningKey(token: string): Promise<string> {
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded?.header.kid;
    if (!kid) {
      throw new Error('Token has no kid');
    }
    const key = await this.getClient().getSigningKey(kid);
    return key.getPublicKey();
  }

  private getClient(): JwksClient {
    if (!this.client) {
      const supabaseUrl = this.config.getOrThrow<string>('SUPABASE_URL');
      this.client = jwksClient({
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
        cache: true,
        cacheMaxAge: 10 * 60 * 1000,
      });
    }
    return this.client;
  }
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

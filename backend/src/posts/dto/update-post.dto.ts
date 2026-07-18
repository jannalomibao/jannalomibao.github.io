import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

// No `slug` (immutable) or `publishedAt` (server-set on first publish only
// — see PostsService.update) — see docs/07-api-contract.md §5.
export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readMinutes?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

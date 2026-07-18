import { IsInt, IsString, Matches, Min } from 'class-validator';

// No `published` field: per docs/07-api-contract.md §5, posts are never
// published on create — publishing is an explicit separate action via PATCH.
export class CreatePostDto {
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase kebab-case',
  })
  slug: string;

  @IsString()
  title: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsString()
  imageUrl: string;

  @IsInt()
  @Min(1)
  readMinutes: number;
}

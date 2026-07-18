import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

// Matches docs/07-api-contract.md §4.
export class CreateProjectDto {
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase kebab-case',
  })
  slug: string;

  @IsString()
  title: string;

  @IsString()
  summary: string;

  @IsString()
  problem: string;

  @IsString()
  role: string;

  @IsString()
  outcome: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  stack: string[];

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsUrl()
  repoUrl?: string;

  @IsOptional()
  @IsUrl()
  demoUrl?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

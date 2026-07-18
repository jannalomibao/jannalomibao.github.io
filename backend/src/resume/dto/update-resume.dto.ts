import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

class ResumeExperienceDto {
  @IsString()
  role: string;

  @IsString()
  org: string;

  @IsString()
  period: string;

  @IsArray()
  @IsString({ each: true })
  points: string[];
}

class ResumeEducationDto {
  @IsString()
  school: string;

  @IsString()
  credential: string;

  @IsString()
  period: string;
}

// No `pdfUrl` — set only via POST /api/admin/resume/pdf (docs/07-api-contract.md §6).
export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeExperienceDto)
  experience?: ResumeExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResumeEducationDto)
  education?: ResumeEducationDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

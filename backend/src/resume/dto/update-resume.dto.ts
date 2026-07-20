import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// @IsNotEmpty() alongside @IsString() (not @IsString() alone) is deliberate:
// the admin form's controlled inputs always send a string for every field —
// new rows default to "" rather than omitting the key — so type-only
// validation could never actually reject an incomplete row (docs/tasks/
// done/005-admin-manage-resume.md's UAC 4 finding). This closes that gap.
class ResumeExperienceDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  org: string;

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsArray()
  @IsString({ each: true })
  points: string[];
}

class ResumeEducationDto {
  @IsString()
  @IsNotEmpty()
  school: string;

  @IsString()
  @IsNotEmpty()
  credential: string;

  @IsString()
  @IsNotEmpty()
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

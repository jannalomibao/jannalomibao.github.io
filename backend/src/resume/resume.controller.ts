import { Body, Controller, Get, Patch, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ResumeService } from './resume.service';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  find() {
    return this.resumeService.find();
  }

  @Get('pdf')
  async findPdf(@Res() res: Response) {
    const url = await this.resumeService.findPdfUrl();
    res.redirect(302, url);
  }
}

@Controller('admin/resume')
@UseGuards(AdminGuard)
export class AdminResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Patch()
  update(@Body() dto: UpdateResumeDto) {
    return this.resumeService.update(dto);
  }
}

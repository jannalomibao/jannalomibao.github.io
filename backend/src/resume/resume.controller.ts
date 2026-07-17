import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ResumeService } from './resume.service';

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

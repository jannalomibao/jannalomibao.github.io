import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async find() {
    const resume = await this.prisma.resume.findFirst();
    // Only reachable on a freshly-migrated DB with no seed row — the init
    // migration seeds one, but the frontend should still degrade gracefully
    // rather than crash if this ever happens (docs/07-api-contract.md §6).
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }
    return resume;
  }

  async findPdfUrl(): Promise<string> {
    const resume = await this.find();
    if (!resume.pdfUrl) {
      throw new NotFoundException('No resume PDF uploaded yet');
    }
    // TODO: once admin upload (POST /api/admin/resume/pdf) lands, this
    // should exchange the stored path for a time-limited Supabase Storage
    // signed URL rather than redirecting to a raw stored URL.
    return resume.pdfUrl;
  }
}

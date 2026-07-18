import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateResumeDto } from './dto/update-resume.dto';

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

  // --- Admin ---------------------------------------------------------
  // Single-row resource — no :id in the route (docs/07-api-contract.md §6).

  async update(dto: UpdateResumeDto) {
    const existing = await this.find();
    const { experience, education, ...rest } = dto;

    // experience/education are Prisma Json columns — class-validator's
    // nested DTO instances need an explicit plain-object cast for the JSON
    // column, or Prisma rejects them as an unrecognized shape. Destructured
    // out above (rather than spread-then-override) so TypeScript doesn't
    // widen the merged type back to a union including the uncast DTO shape.
    const data: Prisma.ResumeUpdateInput = { ...rest };
    if (experience !== undefined) {
      data.experience = experience as unknown as Prisma.InputJsonValue;
    }
    if (education !== undefined) {
      data.education = education as unknown as Prisma.InputJsonValue;
    }

    return this.prisma.resume.update({ where: { id: existing.id }, data });
  }
}

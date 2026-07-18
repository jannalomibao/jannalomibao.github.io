import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { QueryContactDto } from './dto/query-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactSubmissionDto) {
    const submission = await this.prisma.contactSubmission.create({
      data: dto,
    });

    // Best-effort: email delivery must never make a successfully-saved
    // submission look like it failed to the visitor who sent it
    // (docs/07-api-contract.md §7). No provider wired up yet — logged as a
    // clearly-marked stand-in until Resend (or equivalent) is configured.
    try {
      this.notifyOwner(submission);
    } catch (err) {
      this.logger.error('Contact notification failed', err);
    }

    // Deliberately minimal response — see docs/07-api-contract.md §7 on why
    // this doesn't echo the caller's own input back.
    return { id: submission.id, createdAt: submission.createdAt };
  }

  private notifyOwner(submission: { name: string; email: string }): void {
    // TODO: replace with a real transactional email call (architecture doc §8).
    this.logger.log(
      `[STUB] Would notify owner of new contact submission from ${submission.name} <${submission.email}>`,
    );
  }

  // --- Admin ---------------------------------------------------------

  findAllForAdmin(query: QueryContactDto) {
    return this.prisma.contactSubmission.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto) {
    const existing = await this.prisma.contactSubmission.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Contact submission not found');
    }
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}

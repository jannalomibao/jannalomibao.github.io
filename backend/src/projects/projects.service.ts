import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { Project } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

// Public responses omit `published` entirely (docs/07-api-contract.md §3) —
// public callers have no legitimate use for it, and omitting it removes any
// chance of a frontend bug conditionally rendering on a field it shouldn't see.
type PublicProject = Omit<Project, 'published'>;

function toPublic({ published, ...rest }: Project): PublicProject {
  return rest;
}

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';
const RECORD_NOT_FOUND = 'P2025';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublished(): Promise<PublicProject[]> {
    const projects = await this.prisma.project.findMany({
      where: { published: true },
      orderBy: { updatedAt: 'desc' },
    });
    return projects.map(toPublic);
  }

  async findPublishedBySlug(slug: string): Promise<PublicProject> {
    const project = await this.prisma.project.findFirst({
      where: { slug, published: true },
    });
    // Unpublished/missing both 404 identically — see docs/07-api-contract.md §2
    // on why a draft's existence must never leak to an unauthenticated caller.
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return toPublic(project);
  }

  // --- Admin ---------------------------------------------------------

  findAllForAdmin(): Promise<Project[]> {
    return this.prisma.project.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    try {
      return await this.prisma.project.create({ data: dto });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new BadRequestException(
          `A project with slug "${dto.slug}" already exists`,
        );
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    try {
      return await this.prisma.project.update({ where: { id }, data: dto });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === RECORD_NOT_FOUND
      ) {
        throw new NotFoundException('Project not found');
      }
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.project.delete({ where: { id } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === RECORD_NOT_FOUND
      ) {
        throw new NotFoundException('Project not found');
      }
      throw err;
    }
  }
}

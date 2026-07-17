import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Project } from '@prisma/client';

// Public responses omit `published` entirely (docs/07-api-contract.md §3) —
// public callers have no legitimate use for it, and omitting it removes any
// chance of a frontend bug conditionally rendering on a field it shouldn't see.
type PublicProject = Omit<Project, 'published'>;

function toPublic({ published, ...rest }: Project): PublicProject {
  return rest;
}

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
}

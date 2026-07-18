import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { Post } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

// Same public/admin field split as Projects — see docs/07-api-contract.md §3.
type PublicPost = Omit<Post, 'published'>;

function toPublic({ published, ...rest }: Post): PublicPost {
  return rest;
}

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublished(): Promise<PublicPost[]> {
    const posts = await this.prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    });
    return posts.map(toPublic);
  }

  async findPublishedBySlug(slug: string): Promise<PublicPost> {
    const post = await this.prisma.post.findFirst({
      where: { slug, published: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return toPublic(post);
  }

  // --- Admin ---------------------------------------------------------

  findAllForAdmin(): Promise<Post[]> {
    return this.prisma.post.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async create(dto: CreatePostDto): Promise<Post> {
    try {
      // published/publishedAt intentionally not set here — the schema
      // default (published: false, publishedAt: null) applies. Publishing
      // is a separate, explicit PATCH (docs/07-api-contract.md §5).
      return await this.prisma.post.create({ data: dto });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new BadRequestException(
          `A post with slug "${dto.slug}" already exists`,
        );
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    // First-publish sets publishedAt exactly once; unpublishing afterward
    // never clears it, so re-publishing later doesn't fabricate a new
    // "original" publish date (docs/07-api-contract.md §5).
    const isFirstPublish =
      dto.published === true && existing.publishedAt === null;

    return this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        ...(isFirstPublish ? { publishedAt: new Date() } : {}),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Post not found');
    }
    await this.prisma.post.delete({ where: { id } });
  }
}

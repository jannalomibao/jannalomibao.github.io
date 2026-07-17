import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Post } from '@prisma/client';

// Same public/admin field split as Projects — see docs/07-api-contract.md §3.
type PublicPost = Omit<Post, 'published'>;

function toPublic({ published, ...rest }: Post): PublicPost {
  return rest;
}

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
}

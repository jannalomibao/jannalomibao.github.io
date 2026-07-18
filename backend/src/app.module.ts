import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { PostsModule } from './posts/posts.module';
import { ResumeModule } from './resume/resume.module';
import { AuthModule } from './auth/auth.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Only ContactThrottlerGuard-attached routes are subject to this — see
    // its comment for why it isn't applied globally.
    ThrottlerModule.forRoot([{ ttl: 60 * 60 * 1000, limit: 5 }]),
    PrismaModule,
    ProjectsModule,
    PostsModule,
    ResumeModule,
    AuthModule,
    ContactModule,
  ],
})
export class AppModule {}

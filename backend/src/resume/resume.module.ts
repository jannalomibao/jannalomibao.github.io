import { Module } from '@nestjs/common';
import { AdminResumeController, ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ResumeController, AdminResumeController],
  providers: [ResumeService],
})
export class ResumeModule {}

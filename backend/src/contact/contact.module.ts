import { Module } from '@nestjs/common';
import {
  AdminContactController,
  ContactController,
} from './contact.controller';
import { ContactService } from './contact.service';
import { AuthModule } from '../auth/auth.module';
import { ContactThrottlerGuard } from './contact-throttler.guard';

@Module({
  imports: [AuthModule],
  controllers: [ContactController, AdminContactController],
  providers: [ContactService, ContactThrottlerGuard],
})
export class ContactModule {}

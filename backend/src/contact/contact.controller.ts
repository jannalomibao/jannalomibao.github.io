import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { QueryContactDto } from './dto/query-contact.dto';
import { AdminGuard } from '../auth/admin.guard';
import { ContactThrottlerGuard } from './contact-throttler.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(ContactThrottlerGuard)
  create(@Body() dto: CreateContactSubmissionDto) {
    return this.contactService.create(dto);
  }
}

@Controller('admin/contact')
@UseGuards(AdminGuard)
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  findAll(@Query() query: QueryContactDto) {
    return this.contactService.findAllForAdmin(query);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateContactStatusDto) {
    return this.contactService.updateStatus(id, dto);
  }
}

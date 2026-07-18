import { IsIn, IsOptional } from 'class-validator';

export class QueryContactDto {
  @IsOptional()
  @IsIn(['unread', 'read', 'archived'])
  status?: 'unread' | 'read' | 'archived';
}

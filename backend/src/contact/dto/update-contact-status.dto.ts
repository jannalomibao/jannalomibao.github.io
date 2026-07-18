import { IsIn } from 'class-validator';

// 'unread' is deliberately excluded — it's the initial state on creation
// only; there's no supported "mark unread again" flow in v1
// (docs/07-api-contract.md §7).
export class UpdateContactStatusDto {
  @IsIn(['read', 'archived'])
  status: 'read' | 'archived';
}

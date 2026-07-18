import { IsEmail, Length } from 'class-validator';

// Matches docs/07-api-contract.md §7.
export class CreateContactSubmissionDto {
  @Length(1, 200)
  name: string;

  @IsEmail()
  email: string;

  @Length(1, 5000)
  message: string;
}

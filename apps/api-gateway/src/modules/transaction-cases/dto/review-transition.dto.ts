import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewTransitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  evidenceRef?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

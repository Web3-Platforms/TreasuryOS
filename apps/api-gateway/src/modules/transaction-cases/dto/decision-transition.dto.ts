import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class DecisionTransitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  evidenceRef?: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(4000)
  notes!: string;
}

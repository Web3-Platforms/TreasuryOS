import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const helpfulnessValues = ['helpful', 'not_helpful'] as const;
const dispositionValues = ['accepted', 'edited', 'dismissed'] as const;

export class SubmitAiFeedbackDto {
  @IsIn(helpfulnessValues)
  helpfulness!: (typeof helpfulnessValues)[number];

  @IsIn(dispositionValues)
  disposition!: (typeof dispositionValues)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

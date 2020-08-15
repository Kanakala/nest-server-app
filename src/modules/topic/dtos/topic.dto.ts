
import { IsString } from 'class-validator';

export class TopicDto {
  @IsString()
  name: string;

  @IsString()
  description?: string;

  @IsString()
  imageUrl?: string;
}

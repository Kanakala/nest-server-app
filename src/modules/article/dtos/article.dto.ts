
import { IsString, IsBoolean } from 'class-validator';

export class ArticleDto {
  @IsString()
  topicId: string;

  @IsString()
  title: string;

  @IsString()
  imageUrl?: string;

  @IsString()
  content?: string;

  @IsBoolean()
  isFeatured?: boolean;
}

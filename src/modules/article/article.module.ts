
import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { ArticleResolver } from './article.resolver';
import { Article, ArticleModel } from './article.schema';
import { TopicModule } from 'modules/topic/topic.module';

@Module({
  imports: [
    TopicModule, TypegooseModule.forFeature([Article]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleResolver, ArticleModel, Article],
  exports: [ArticleModel, Article],
})
export class ArticleModule {}

  
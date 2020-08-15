
import { Module, forwardRef } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TopicResolver } from './topic.resolver';
import { Topic } from './topic.schema';
import { ArticleModule } from 'modules/article/article.module';

@Module({
  imports: [
    forwardRef(() => ArticleModule), TypegooseModule.forFeature([Topic]),
  ],
  controllers: [TopicController],
  providers: [TopicService, TopicResolver],
  exports: [TopicService],
})
export class TopicModule {}

  
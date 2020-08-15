
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose';
import { FieldResolver, Root } from 'type-graphql';
import { UseGuards, Injectable } from '@nestjs/common';
import { BackendLogger } from 'modules/logger/BackendLogger';
import { GqlAuthGuard } from 'modules/auth/guards/graphqlAuth.guard';
import { GqlRolesGuard } from 'modules/role/guards/graphqlRoles.guard';
import { Roles } from 'modules/role/decorators/roles.decorator';
import { roles } from 'common/constants';
import { TopicService } from './topic.service';
import { Topic } from 'modules/topic/topic.schema';
import { TopicQueryInput } from './dtos/queryInput.dto';
import { TopicInput } from './dtos/topicInput.dto';
import { UpdateTopicDto } from './dtos/updateTopic.dto';
import { SearchResult } from 'interfaces/searchResult.dto';
import { Article, ArticleModel } from 'modules/article/article.schema';
import { PAGE_SIZE } from 'common/constants';
import { ArticleQueryInput } from 'modules/article/dtos/queryInput.dto';

@Resolver(of => Topic)
export class TopicResolver {
  private readonly logger = new BackendLogger(TopicResolver.name);
  private readonly articleModel = new Article().getModelForClass(Article, {
    schemaOptions: { timestamps: true },
  });

  constructor(
    private readonly topicService: TopicService,
  ) {}

  @Mutation(() => Topic)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(roles.ADMIN)
  async createTopic(
    @Args('topicInput') topicInput: TopicInput,
  ) {
    return this.topicService.create(topicInput);
  }

  @Mutation(() => Topic)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(roles.ADMIN)
  async updateTopic(
    @Args('topicInput') topicInput: UpdateTopicDto,
  ) {
    return this.topicService.update(topicInput);
  }

  @Mutation(() => Topic)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(roles.ADMIN)
  async deleteTopic(
    @Args('_id') _id: string,
  ) {
    return this.topicService.delete(_id);
  }

  @Query(() => Topic)
  async getPublicTopic(
    @Args('_id') _id: string,
  ) {
    return this.topicService.findOneById(_id);
  }

  @Query(() => Topic)
  @UseGuards(GqlAuthGuard)
  async getTopic(
    @Args('_id') _id: string,
  ) {
    return this.topicService.findOneById(_id);
  }

  @Query(() => SearchResult)
  async filterTopicsPublicly(
    @Args('query') query: TopicQueryInput,
  ) {
    const { filter, sortBy, pageNum, pageSize } = query;
    return this.topicService.filter(filter, sortBy, pageNum, pageSize);
  }

  @Query(() => SearchResult)
  @UseGuards(GqlAuthGuard)
  async filterTopics(
    @Args('query') query: TopicQueryInput,
  ) {
    const { filter, sortBy, pageNum, pageSize } = query;
    return this.topicService.filter(filter, sortBy, pageNum, pageSize);
  }

  @FieldResolver(() => SearchResult)
  @UseGuards(GqlAuthGuard)
  async articles(
    @Root() topic,
    @Args('query') query: ArticleQueryInput,
  ): Promise<SearchResult> {
    const { pageNum, pageSize, sortBy } = query;
    const limit = pageSize;
    const skip = (pageNum - 1) * limit;
    const filter = { topicId: topic._id }
    const data = await this.articleModel.find(filter)
      .sort(sortBy)
      .limit(limit)
      .skip(skip);
    const totalCount = await this.articleModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = pageNum + 1 <= totalPages;
    const hasPreviousPage = pageNum - 1 >= 1;

    const newData = data.map(item => {
      const newItem = Object.assign(new Article(), { ...item });
      Object.keys(item).map(key => {
        if (key === '_doc') {
          Object.keys(item[key]).map(innerKey => {
            newItem[innerKey] = item[key][innerKey];
          })
        }
      })
      return newItem;
    });

    return {
      results: newData,
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
      }
    }
  }

  @FieldResolver(() => SearchResult)
  async publicArticles(
    @Root() topic,
    @Args('query') query: ArticleQueryInput,
  ): Promise<SearchResult> {
    const { pageNum, pageSize, sortBy } = query;
    const limit = pageSize;
    const skip = (pageNum - 1) * limit;
    const filter = { topicId: topic._id, isFeatured: { $ne: true } }
    const data = await this.articleModel.find(filter)
      .sort(sortBy)
      .limit(limit)
      .skip(skip);
    const totalCount = await this.articleModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = pageNum + 1 <= totalPages;
    const hasPreviousPage = pageNum - 1 >= 1;

    const newData = data.map(item => {
      const newItem = Object.assign(new Article(), { ...item });
      Object.keys(item).map(key => {
        if (key === '_doc') {
          Object.keys(item[key]).map(innerKey => {
            newItem[innerKey] = item[key][innerKey];
          })
        }
      })
      return newItem;
    });

    return {
      results: newData,
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
      }
    }
  }
}


import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';
import { BackendLogger } from 'modules/logger/BackendLogger';
import { FieldResolver, Root } from 'type-graphql';
import { GqlAuthGuard } from 'modules/auth/guards/graphqlAuth.guard';
import { GqlRolesGuard } from 'modules/role/guards/graphqlRoles.guard';
import { HttpExceptionFilter } from 'modules/exception/BackendException';
import { ErrorsInterceptor } from 'modules/exception/errors.interceptor';
import { Roles } from 'modules/role/decorators/roles.decorator';
import { roles } from 'common/constants';
import { 
  UseGuards, 
  UseFilters,
  HttpException,
  UseInterceptors,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { Article } from 'modules/article/article.schema';
import { ArticleInput } from 'modules/article/dtos/articleInput.dto';
import { UpdateArticleDto } from 'modules/article/dtos/updateArticle.dto';
import { ArticleQueryInput } from 'modules/article/dtos/queryInput.dto';
import { SearchResult } from 'interfaces/searchResult.dto';

@Resolver(of => Article)
@UseInterceptors(ErrorsInterceptor)
@UseFilters(new HttpExceptionFilter())
export class ArticleResolver {
  private readonly logger = new BackendLogger(ArticleResolver.name);
  private readonly articleModel = new Article().getModelForClass(Article, {
    schemaOptions: { timestamps: true },
  });

  constructor(private readonly articleService: ArticleService) {}
  @Mutation(() => Article)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(roles.ADMIN)
  async createArticle(
    @Context('res')
    @Args('articleInput') articleInput: ArticleInput,
  ) {
    return this.articleService.create(articleInput);
  }

  @Mutation(() => Article)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(roles.ADMIN)
  async updateArticle(
    @Args('articleInput') articleInput: UpdateArticleDto,
  ) {
    return this.articleService.update(articleInput);
  }

  @Mutation(() => Article)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Roles(roles.ADMIN)
  async deleteArticle(
    @Args('_id') _id: string,
  ) {
    return this.articleService.delete(_id);
  }

  @Query(() => Article)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async getArticle(
    @Args('_id') _id: string,
  ) {
    return this.articleService.findOneById(_id);
  }

  @Query(() => SearchResult)
  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  async filterArticles(
    @Args('query') query: ArticleQueryInput,
  ) {
    const { filter, sortBy, pageNum, pageSize } = query;
    return this.articleService.filter(filter, sortBy, pageNum, pageSize, true);
  }

  @Query(() => Article)
  async getPublicArticle(
    @Args('_id') _id: string,
  ) {
    const publicArticle = await this.articleService.findPublicArticle(_id);
    return publicArticle[0];
  }

  @Query(() => SearchResult)
  async filterPublicArticles(
    @Args('query') query: ArticleQueryInput,
  ) {
    const { filter, sortBy, pageNum, pageSize } = query;
    return this.articleService.filter(filter, sortBy, pageNum, pageSize, false);
  }

  @FieldResolver(() => SearchResult)
  @UseGuards(GqlAuthGuard)
  async taggedArticles(
    @Root() article,
    @Args('query') query: ArticleQueryInput,
  ): Promise<SearchResult> {
    const { pageNum, pageSize, sortBy } = query;
    const limit = pageSize;
    const skip = (pageNum - 1) * limit;
    const filter = {
      tags : { $in : article.tags },
      _id: { $ne: article._id },
    }
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

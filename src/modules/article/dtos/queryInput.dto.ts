import { InputType, Field } from 'type-graphql';
import { SortBy } from '../../../interfaces/searchResult.dto';
import { PAGE_SIZE } from 'common/constants';

@InputType()
export class ArticleFilterInputDto {
  @Field({ nullable: true })
  _id?: string;

  @Field({ nullable: true })
  topicId?: string;

  @Field({ nullable: true })
  isFeatured?: boolean;
}

@InputType()
export class ArticleSortBy {
  @Field(type => SortBy, { nullable: true })
  title?: SortBy;

  @Field(type => SortBy, { nullable: true })
  createdAt?: SortBy;
}

@InputType()
export class ArticleQueryInput {
  @Field({ nullable: true })
  filter?: ArticleFilterInputDto = {}

  @Field()
  sortBy?: ArticleSortBy = {}

  @Field({ nullable: true })
  pageNum?: number = 1

  @Field({ nullable: true })
  pageSize?: number = PAGE_SIZE
}

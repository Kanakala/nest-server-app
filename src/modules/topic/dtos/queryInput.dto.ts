import { ObjectType, InputType, Field } from 'type-graphql';
import { SortBy } from '../../../interfaces/searchResult.dto';
import { PAGE_SIZE } from 'common/constants';

@InputType()
export class TopicFilterInputDto {
  @Field({ nullable: true })
  _id?: string;
}

@InputType()
export class TopicSortBy {
  @Field(type => SortBy, { nullable: true })
  name?: SortBy;

  @Field(type => SortBy, { nullable: true })
  createdAt?: SortBy;
}

@InputType()
export class TopicQueryInput {
  @Field({ nullable: true })
  filter?: TopicFilterInputDto = {}

  @Field({ nullable: true })
  sortBy?: TopicSortBy = {}

  @Field({ nullable: true })
  pageNum?: number = 1

  @Field({ nullable: true })
  pageSize?: number = PAGE_SIZE
}

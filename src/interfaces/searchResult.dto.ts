import { ObjectType, Field, createUnionType, Int, registerEnumType } from 'type-graphql';
import { Article } from 'modules/article/article.schema';
import { Topic } from 'modules/topic/topic.schema';
import { PageInfo } from './pageInfo.dto';

export const ResultUnion = createUnionType({
  name: 'Result',
  types: () => [Article, Topic],
});

export enum SortBy {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortBy, {
  name: 'SortBy',
});

@ObjectType()
export class SearchResult {
  @Field(type => [ResultUnion], { nullable: true })
  results: Array<typeof ResultUnion>;

  @Field(type => Int)
  totalCount: number;

  @Field(type => PageInfo)
  pageInfo: PageInfo;
}

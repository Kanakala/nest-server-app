import { InputType, Field } from 'type-graphql';

@InputType()
export class ArticleInput {
  @Field()
  topicId: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  isFeatured?: boolean;
}

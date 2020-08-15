import { InputType, Field } from 'type-graphql';

@InputType()
export class UpdateArticleDto {
  @Field()
  _id: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  isFeatured?: boolean;
}

import { InputType, Field } from 'type-graphql';

@InputType()
export class TopicInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

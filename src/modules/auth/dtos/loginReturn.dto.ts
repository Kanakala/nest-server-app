import { ObjectType, Field } from 'type-graphql';
import { Role } from 'modules/user/schemas/role.schema';

@ObjectType()
export class LoginReturnDto {
  @Field()
  expiresIn: string;

  @Field()
  accessToken: string;

  @Field(() => [Role])
  roles: Role[];
}

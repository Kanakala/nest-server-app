import * as mongoose from 'mongoose';
import { Typegoose, prop } from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';
import { roles } from 'common/constants';
import { Roles } from 'modules/role/decorators/roles.decorator';

@ObjectType()
export class Role extends Typegoose {
  @prop()
  @Field()
  name: string;

  @prop()
  @Field()
  enabled: boolean;
}

export const RoleModel = new Role().getModelForClass(Role, {
  schemaOptions: { timestamps: true },
});
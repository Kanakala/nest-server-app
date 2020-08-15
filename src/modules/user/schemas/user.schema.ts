import * as mongoose from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { prop, pre, post, Typegoose} from '@typegoose/typegoose';
import { ObjectType, Field, Authorized } from 'type-graphql';
import { UseGuards, HttpStatus } from '@nestjs/common';

import { Role } from 'modules/user/schemas/role.schema';
import { roles } from 'common/constants';
import { Roles } from 'modules/role/decorators/roles.decorator';
import { GqlRolesGuard } from 'modules/role/guards/graphqlRoles.guard';
import { LoginRecord } from 'modules/loginRecord/loginRecord.schema';
const _ = require('lodash');

@pre<User>('save', function(next) {
  const newDate = new Date();
  this.createdAt = newDate;
  this.updatedAt = newDate;
  // Only hash the password if the field has been modified. In other words, don't generate
  // a new hash each time the user doc is saved.
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash the password before saving
  this.password = bcryptjs.hashSync((this as any).password, 10);

  next();
})

@post<User>('validate', function(error, doc, next) {
  if (error) {
    error.status = error.status || HttpStatus.BAD_REQUEST;
    return next(error);
  }
  next();
})

@pre<User>('findOneAndUpdate', function(next) {
  const newDate = new Date();
  this._update.updatedAt = newDate;
  next();
})

@ObjectType()
export class User extends Typegoose {
  @Field()
  @Authorized([roles.ADMIN])
  _id: string;

  @prop({ required: true })
  @Field()
  name: string;

  @prop({ required: true, unique: true, validate: /\S+@\S+\.\S+/ })
  @Field()
  email: string;

  @prop({ required: true })
  password: string;

  @prop()
  @Field()
  lastLogin: Date;

  @Field()
  @prop({ default: 0 })
  loginAttempts: number;

  @prop({ default: false })
  locked: boolean;

  @prop()
  group: string;

  @prop()
  refreshToken: string;

  @prop()
  refreshTokenExpires: Date;

  @prop({ default: [] })
  @Field(() => [Role])
  roles: Role[];

  @prop()
  @Field(() => [LoginRecord])
  loginRecords: LoginRecord[];

  @prop()
  @Field()
  updatedAt: Date;

  @prop()
  @Field()
  createdAt: Date;
}

export const UserModel = new User().getModelForClass(User, {
  schemaOptions: { timestamps: true },
});

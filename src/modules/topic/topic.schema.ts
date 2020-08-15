
import * as mongoose from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { Typegoose, prop, Ref, pre, ModelType } from '@typegoose/typegoose';
import { ObjectType, Field, Authorized, FieldResolver, Root } from 'type-graphql';
import { UseGuards } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { Resolver } from '@nestjs/graphql';
import { Article } from 'modules/article/article.schema';
import { roles } from 'common/constants';
import { GqlRolesGuard } from 'modules/role/guards/graphqlRoles.guard';
import { SearchResult } from 'interfaces/searchResult.dto';

@pre<Topic>('save', function(next) {
  const newDate = new Date();
  this.createdAt = newDate;
  this.updatedAt = newDate;
  next();
})

@pre<Topic>('findOneAndUpdate', function(next) {
  const newDate = new Date();
  this._update.updatedAt = newDate;
  next();
})

@ObjectType()
export class Topic extends Typegoose {
  @Field()
  _id: string;

  @prop()
  @Field()
  name: string;

  @prop()
  @Field({ nullable: true })
  description: string;

  @prop({ validate: /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig })
  @Field({ nullable: true })
  imageUrl: string;

  @prop()
  @Field()
  updatedAt: Date;

  @prop()
  @Field()
  createdAt: Date;

  @Authorized()
  @Field(type => SearchResult, { nullable: true })
  articles: SearchResult;

  @Field(type => SearchResult, { nullable: true })
  publicArticles: SearchResult;
}

export const TopicModel = new Topic().getModelForClass(Topic, {
  schemaOptions: { timestamps: true },
});

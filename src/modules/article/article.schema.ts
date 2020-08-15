
import * as mongoose from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { pre, Typegoose, prop, Ref } from '@typegoose/typegoose';
import { ObjectType, Field, Authorized } from 'type-graphql';
import { UseGuards, HttpStatus } from '@nestjs/common';
import { roles } from 'common/constants';
import { GqlRolesGuard } from 'modules/role/guards/graphqlRoles.guard';
import { Topic } from 'modules/topic/topic.schema';
import { SearchResult } from 'interfaces/searchResult.dto';

@pre<Article>('save', function(next) {
  const newDate = new Date();
  this.createdAt = newDate;
  this.updatedAt = newDate;
  this.viewedCount = 0;
  next();
})

@pre<Article>('findOneAndUpdate', function(next) {
  const newDate = new Date();
  this._update.updatedAt = newDate;
  next();
})

@pre<Article>('findOne', async function(next) {
  const updatedArticle = await this.model.findOneAndUpdate(
    { _id: this._conditions._id },
    { $inc: { viewedCount: 1 } }
  );
  next();
})

@ObjectType()
export class Article extends Typegoose {
  @Field()
  _id: string;

  @prop()
  @Field()
  title: string;

  @prop({ validate: /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig })
  @Field({ nullable: true })
  imageUrl: string;

  @prop()
  @Field({ nullable: true })
  content: string;

  @prop()
  @Field({ nullable: true })
  isFeatured: boolean;

  @prop()
  @Field()
  viewedCount: number;

  @prop()
  @Field()
  updatedAt: Date;

  @prop()
  @Field()
  createdAt: Date;

  @prop({ ref: Topic, required: true })
  @Field(_type => Topic)
  topicId?: Ref<Topic>;

  @prop()
  @Field(type => [String], { nullable: true })
  tags?: string[];

  @Authorized()
  @Field(type => SearchResult, { nullable: true })
  taggedArticles: SearchResult;
}

export const ArticleModel = new Article().getModelForClass(Article, {
  schemaOptions: { timestamps: true },
});

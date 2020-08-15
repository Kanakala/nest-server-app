import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { ConsoleModule } from 'nestjs-console';
import * as dotenv from 'dotenv';
dotenv.config();

import { AuthModule } from 'modules/auth/auth.module';
import { UserModule } from 'modules/user/user.module';
import { BootstrapModule } from 'modules/bootstrap/bootstrap.module';
import { ArticleModule } from 'modules/article/article.module';
import { TopicModule } from 'modules/topic/topic.module';
import { authChecker } from 'modules/auth/guards/typegraphqlAuthChecker';
import { GraphQLModule } from '@nestjs/graphql';
import { isDevEnv } from 'common/util';
import { TypeGraphQLBuildSchemaOptions } from 'interfaces/ITypeGraphQLBuildSchemaOptions';

@Module({
  imports: [
    ConsoleModule,
    GraphQLModule.forRoot({
      playground: isDevEnv(),
      autoSchemaFile: 'schema.gql',
      context: ({ req, res }) => ({ req, res }),
      // See: https://github.com/nestjs/graphql/issues/305
      buildSchemaOptions: { authChecker } as TypeGraphQLBuildSchemaOptions,
      uploads: {
        maxFileSize: 20000000, // 20 MB
        maxFiles: 5
      },
      installSubscriptionHandlers: true,
    }),
    TypegooseModule.forRoot('mongodb://localhost:27017/nest-boilerplate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useMongoClient: true,
      // useFindAndModify: true,
      // useCreateIndex: true,
      // autoIndex: true,
    }),
    AuthModule,
    UserModule,
    BootstrapModule,
    ArticleModule,
    TopicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
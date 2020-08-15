import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { BackendLogger } from 'modules/logger/BackendLogger';
import { GqlAuthGuard } from 'modules/auth/guards/graphqlAuth.guard';
import { GqlRolesGuard } from 'modules/role/guards/graphqlRoles.guard';
import { Roles } from 'modules/role/decorators/roles.decorator';
import { roles } from 'common/constants';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'modules/user/schemas/user.schema';
import { FieldResolver } from 'type-graphql';
import { LoginRecord } from 'modules/loginRecord/loginRecord.schema';
import { LoginRecordService } from 'modules/loginRecord/loginRecord.service';
import { AuthService } from 'modules/auth/auth.service';
import { CreateUserDto } from 'modules/user/dtos/createUser.dto';
import { LoginReturnDto } from 'modules/auth/dtos/loginReturn.dto';
// import { NotificationStatusService } from 'src/notificationStatus/notificationStatus.service';
const pubSub = new PubSub();

@Resolver(User)
export class UserResolver {
  private readonly logger = new BackendLogger(UserResolver.name);

  // private readonly notificationStatusService: NotificationStatusService,
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly loginRecordService: LoginRecordService,
  ) {}

  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Query(() => User)
  async user(@Context('req') { user }) {
    this.logger.debug(`Getting user info: ${user.email}`);
    return this.userService.findOneByEmail(user.email);
  }

  @Mutation(() => LoginReturnDto)
  async createUser(
    @Context() context,
    @Args() { email, password, name }: CreateUserDto) {
    const user = await this.userService.create({ email, password, name });
    const token = await this.authService.login(email, password);
    context.res.cookie('refreshToken', user.refreshToken, { httpOnly: true });
    return { ...token, roles: user.roles };
  }

  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Mutation(() => User)
  @Roles(roles.ADMIN)
  async addRole(@Args('role') role: string, @Args('userId') userId: string) {
    return this.userService.addRole(userId, role);
  }

  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @Mutation(() => User)
  @Roles(roles.ADMIN)
  async disableRole(
    @Args('userId') userId: string,
    @Args('role') role: string,
  ) {
    return this.userService.disableRole(userId, role);
  }

  @UseGuards(GqlAuthGuard, GqlRolesGuard)
  @ResolveProperty(() => [LoginRecord])
  async loginRecords(@Parent() user: User) {
    this.logger.log(`Resolving login records for user: ${user.email}`);
    return await this.loginRecordService.findAllByUserId(user._id);
  }

  @Query(returns => User)
  @UseGuards(GqlAuthGuard)
  whoami(@Context('req') { user }: { user: User }) {
    this.logger.log(`currentUser: ${JSON.stringify(user)}`);
    return this.userService.findOneByEmail(user.email);
  }

  @Subscription(returns => User)
  userAdded() {
    return pubSub.asyncIterator('userAdded');
  }
}

import { Resolver, Query, Args, Context, GqlExecutionContext } from '@nestjs/graphql';
import { BackendLogger } from 'modules/logger/BackendLogger';
import { AuthService } from './auth.service';
import { UserService } from 'modules/user/user.service';
import { LoginReturnDto } from 'modules/auth/dtos/loginReturn.dto';
import { LoginRecordService } from 'modules/loginRecord/loginRecord.service';

@Resolver('Auth')
export class AuthResolver {
  private readonly logger = new BackendLogger(AuthResolver.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly loginRecordService: LoginRecordService,
  ) {}

  @Query(() => LoginReturnDto)
  async login(
    @Context('req') req,
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context,
  ) {
    const { token, user } = await this.authService.login(email, password);

    // We'll only get to this point if the login is successful, so we
    // can create a login record now
    await this.loginRecordService.create(req.ip, user.id);
    context.res.cookie('refreshToken', user.refreshToken, { httpOnly: true });

    return { ...token, roles: user.roles };
  }

  @Query(() => LoginReturnDto)
  async resetToken(
    @Context('req') req,
    @Args('email') email: string,
    @Args('refreshToken') refreshToken: string,
    @Context() context,
  ) {
    const { token, user } = await this.authService.resetToken(email, refreshToken);

    await this.loginRecordService.create(req.ip, user.id);
    context.res.cookie('refreshToken', user.refreshToken, { httpOnly: true });

    return { ...token, roles: user.roles };
  }
}

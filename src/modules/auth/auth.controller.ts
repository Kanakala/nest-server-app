import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  Req,
} from '@nestjs/common';
import { UserService } from 'modules/user/user.service';
import { BackendLogger } from 'modules/logger/BackendLogger';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { LoginRecordService } from 'modules/loginRecord/loginRecord.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new BackendLogger(AuthController.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService, 
    private readonly loginRecordService: LoginRecordService,
  ) {}

  @Post('login')
  async login(@Req() req, @Body() { email, password }: LoginDto) {
    const { token, user } = await this.authService.login(email, password);

    // We'll only get to this point if the login is successful, so we
    // can create a login record now
    await this.loginRecordService.create(req.ip, user.id);

    return { ...token, roles: user.roles };
  }
}

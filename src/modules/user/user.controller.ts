import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  UseFilters,
  HttpException, HttpStatus,
  UseInterceptors,
} from '@nestjs/common';

import { BackendLogger } from 'modules/logger/BackendLogger';
import { HttpExceptionFilter } from 'modules/exception/BackendException';
import { ErrorsInterceptor } from 'modules/exception/errors.interceptor';
import { CreateUserDto } from './dtos/createUser.dto';
import { UserService } from './user.service';
import { RolesGuard } from 'modules/role/guards/roles.guard';
import { roles } from 'common/constants';
import { Roles } from 'modules/role/decorators/roles.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwtAuth.guard';

@Controller('user')
@UseFilters(new HttpExceptionFilter())
export class UserController {
  private readonly logger = new BackendLogger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(ErrorsInterceptor)
  @UseFilters(new HttpExceptionFilter())
  async createUser(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    this.logger.log(`Creating new user: ${createUserDto.email}`);
    return await this.userService.create(createUserDto);
  }
}

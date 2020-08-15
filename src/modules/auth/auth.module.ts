import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { UserModule } from 'modules/user/user.module';
import { AuthResolver } from './auth.resolver';
import { LoginRecordModule } from 'modules/loginRecord/loginRecord.module';
import { TOKEN_EXPIRES_IN } from 'common/constants';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.APP_KEY,
      signOptions: {
        expiresIn: TOKEN_EXPIRES_IN,
      },
    }),
    UserModule,
    LoginRecordModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}

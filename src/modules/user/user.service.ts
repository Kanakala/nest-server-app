import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { ModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { User, UserModel } from 'modules/user/schemas/user.schema';
import { BackendLogger } from 'modules/logger/BackendLogger';
import { CreateUserDto } from './dtos/createUser.dto';
import { RoleModel, Role } from 'modules/user/schemas/role.schema';
const randtoken = require('rand-token');

@Injectable()
export class UserService {
  private readonly logger = new BackendLogger(UserService.name);

  constructor(
    @InjectModel(User) private readonly userModel: ModelType<User>,
    @InjectModel(Role) private readonly roleModel: ModelType<Role>,
  ) {}

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findOneById(id: string) {
    return await this.userModel.findById(id);
  }

  async findAll() {
    return await this.userModel.find();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    const newRefreshToken: string = randtoken.uid(256);
    newUser.refreshToken = newRefreshToken;
    return await newUser.save();
  }

  async addRole(userId: string, roleName: string) {
    const user = await this.findOneById(userId);

    // Only add the role if the user doesn't already have it
    const existingRole = user.roles.find(role => role.name === roleName);
    if (existingRole) {
      // If they have the role already, make sure its enabled here
      this.logger.log(`User: ${user.email} already has role: ${roleName}`);
      existingRole.enabled = true;
      user.markModified('roles');
      return await user.save();
    }

    user.roles.push(new this.roleModel({ name: roleName, enabled: true }));
    user.markModified('roles');
    return await user.save();
  }

  async disableRole(userId: string, roleName: string) {
    return await this.userModel.findOneAndUpdate(
      { _id: userId, 'roles.name': roleName },
      {
        $set: {
          'roles.$.enabled': false,
        },
      },
      // Return the doc after the update
      { new: true },
    );
  }

  async changePass(id: string, newPass: string) {
    const user = await this.findOneById(id);
    user.password = newPass;
    return await user.save();
  }

  async updateUser(id: string, updateObj: User) {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateObj, { new: true });
    return updatedUser;
  }

  async handleInvalidPassword(user) {
    user.loginAttempts = user.loginAttempts + 1;

    if (user.loginAttempts > 5) {
      this.logger.warn(
        `User entered invalid password too many times: ${user.email}`,
      );
      user.locked = true;
    }

    await user.save();
  }

  async handleSuccessfulLogin(user) {
    user.lastLogin = new Date(dayjs().toISOString());
    user.loginAttempts = 0;
    const newRefreshToken: string = randtoken.uid(256);
    user.refreshToken = newRefreshToken;
    return await user.save();
  }

  async findByRefreshToken(email: string, refreshToken: string): Promise<User> {
    const user = await this.userModel.find({ email, refreshToken });
    return user[0];
  }
}
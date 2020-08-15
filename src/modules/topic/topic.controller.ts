
import {
  Controller,
  Param,
  Post,
  Query,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BackendLogger } from 'modules/logger/BackendLogger';
import { TopicDto } from './dtos/topic.dto';
import { TopicService } from './topic.service';
import { RolesGuard } from 'modules/role/guards/roles.guard';
import { roles } from 'common/constants';
import { Roles } from 'modules/role/decorators/roles.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwtAuth.guard';

@Controller('topic')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopicController {
  private readonly logger = new BackendLogger(TopicController.name);

  constructor(private readonly topicService: TopicService) {}

  @Get()
  async findOne(@Param() { id }) {
    return this.topicService.findOneById(id);
  }

  @Post()
  @Roles(roles.ADMIN)
  @UseGuards(JwtAuthGuard)
  async createTopic(@Body(new ValidationPipe()) createTopicDto: TopicDto) {
    this.logger.log(`Creating new topic`);
    return await this.topicService.create(createTopicDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Query('id') id) {
    return await this.topicService.uploadFile(file, id);
  }
}


import {
  Controller,
  Param,
  Query,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { BackendLogger } from 'modules/logger/BackendLogger';
import { ArticleDto } from './dtos/article.dto';
import { ArticleService } from './article.service';
import { RolesGuard } from 'modules/role/guards/roles.guard';
import { roles } from 'common/constants';
import { Roles } from 'modules/role/decorators/roles.decorator';
import { JwtAuthGuard } from 'modules/auth/guards/jwtAuth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('article')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArticleController {
  private readonly logger = new BackendLogger(ArticleController.name);

  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findOne(@Param() { id }) {
    return this.articleService.findOneById(id);
  }

  @Post()
  @Roles(roles.ADMIN)
  @UseGuards(JwtAuthGuard)
  async createArticle(@Body(new ValidationPipe()) createArticleDto: ArticleDto) {
    this.logger.log(`Creating new article`);
    return await this.articleService.create(createArticleDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Query('id') id) {
    return await this.articleService.uploadFile(file, id);
  }
}

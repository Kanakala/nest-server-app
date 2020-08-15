
import { Injectable } from '@nestjs/common';
import { ModelType, InstanceType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { plainToClass } from 'class-transformer';
import { Topic, TopicModel } from 'modules/topic/topic.schema';
import { BackendLogger } from 'modules/logger/BackendLogger';
import { TopicDto } from './dtos/topic.dto';
import { UpdateTopicDto } from './dtos/updateTopic.dto';
import { TopicFilterInputDto, TopicSortBy } from './dtos/queryInput.dto';
import { SearchResult } from 'interfaces/searchResult.dto';
import { PAGE_SIZE } from 'common/constants';
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

@Injectable()
export class TopicService {
  private readonly logger = new BackendLogger(TopicService.name);
  constructor(
    @InjectModel(Topic) private readonly topicModel: ModelType<Topic>
  ) {}
  async findOneById(id: string) {
    return await this.topicModel.findById(id);
  }
  async findAll() {
    return await this.topicModel.find();
  }
  async create(createTopicDto: TopicDto): Promise<Topic> {
    const newTopic = new this.topicModel(createTopicDto);
    return await newTopic.save();
  }
  async update(updateTopicDto: UpdateTopicDto): Promise<Topic> {
    return await this.topicModel.findByIdAndUpdate(updateTopicDto._id, updateTopicDto, { new: true });
  }
  async delete(id: string): Promise<Topic> {
    return await this.topicModel.findByIdAndRemove(id);
  }
  async filter(
    filter: TopicFilterInputDto = {},
    sortBy: TopicSortBy = {},
    pageNum: number = 1,
    pageSize?: number
  ): Promise<SearchResult> {
    const defaultPageSize: number = PAGE_SIZE;
    const limit = pageSize || defaultPageSize;
    const skip = (pageNum - 1) * limit;
    let data = await this.topicModel.find(filter)
      .sort(sortBy)
      .limit(limit)
      .skip(skip);
    const newData = data.map(item => {
      const newItem = Object.assign(new Topic(), { ...item });
      Object.keys(item).map(key => {
        if (key === '_doc') {
          Object.keys(item[key]).map(innerKey => {
            newItem[innerKey] = item[key][innerKey];
          })
        }
      })
      return newItem;
    });

    const totalCount = await this.topicModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = pageNum + 1 <= totalPages;
    const hasPreviousPage = pageNum - 1 >= 1;

    return {
      results: newData,
      totalCount,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
      }
    }
  }
  async uploadFile (file, id): Promise<Topic> {
    const existingFile = await this.findOneById(id);
    if (!existingFile) {
      throw new Error('Please provide a valid topic');
    }
    const filesDir = path.join(__dirname, '../../../../nextjs-app/public/'); // pushing to client side public folder
    const filePath = `${filesDir}/${file.originalname}`;
    await fs.ensureFile(filePath);
    await fs.writeFileSync(filePath, file.buffer);
    existingFile.imageUrl = file.originalname;
    const updatedTopic = await this.update(existingFile);
    return updatedTopic;
  }
}

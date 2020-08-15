
import { Injectable } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { Article, ArticleModel } from 'modules/article/article.schema';
import { TopicService } from 'modules/topic/topic.service';
import { BackendLogger } from 'modules/logger/BackendLogger';
import { ArticleDto } from './dtos/article.dto';
import { ArticleFilterInputDto, ArticleSortBy } from './dtos/queryInput.dto';
import { UpdateArticleDto } from './dtos/updateArticle.dto';
import { SearchResult } from 'interfaces/searchResult.dto';
import { PAGE_SIZE } from 'common/constants';
const fs = require('fs-extra');
const path = require('path');

@Injectable()
export class ArticleService {
  private readonly logger = new BackendLogger(ArticleService.name);
  constructor(
    private readonly topicService: TopicService,
    @InjectModel(Article) private readonly articleModel: ModelType<Article>,
  ) {}
  async findOneById(id: string): Promise<Article> {
    return await this.articleModel.findById(id);
  }
  async findPublicArticle(id: string): Promise<Article[]> {
    const articles = await this.articleModel.find({ _id: id, isFeatured: { $ne: true } });
    return articles;
  }
  async findAll(): Promise<Article[]> {
    return await this.articleModel.find();
  }
  async create(createArticleDto: ArticleDto): Promise<Article> {
    const existingTopic = await this.topicService.findOneById(createArticleDto.topicId);
    if (!existingTopic) {
      throw new Error('Please provide a valid topic');
    }
    const newArticle = new this.articleModel(createArticleDto);
    return await newArticle.save();
  }
  async update(updateArticleDto: UpdateArticleDto): Promise<Article> {
    return await this.articleModel.findByIdAndUpdate(updateArticleDto._id, updateArticleDto, { new: true });
  }
  async delete(id: string): Promise<Article> {
    return await this.articleModel.findByIdAndRemove(id);
  }
  async filter(
    filter: ArticleFilterInputDto = {},
    sortBy: ArticleSortBy = {},
    pageNum: number = 1,
    pageSize?: number,
    loggedIn: boolean = false,
  ): Promise<SearchResult> {
    const defaultPageSize: number = PAGE_SIZE;
    const limit = pageSize || defaultPageSize;
    const skip = (pageNum - 1) * limit;
    const modifiedFilter = loggedIn === true ? filter : { ...filter, isFeatured: { $ne: true } } 
    const data = await this.articleModel.find(modifiedFilter)
      .sort(sortBy)
      .limit(limit)
      .skip(skip);

    const newData = data.map(item => {
      const newItem = Object.assign(new Article(), { ...item });
      Object.keys(item).map(key => {
        if (key === '_doc') {
          Object.keys(item[key]).map(innerKey => {
            newItem[innerKey] = item[key][innerKey];
          })
        }
      })
      return newItem;
    });

    const totalCount = await this.articleModel.countDocuments(modifiedFilter);
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
  async uploadFile (file, id): Promise<Article> {
    const existingFile = await this.findOneById(id);
    if (!existingFile) {
      throw new Error('Please provide a valid article');
    }
    const filesDir = path.join(__dirname, '../../../files/articles/');
    const filePath = `${filesDir}/${file.originalname}`;
    await fs.ensureFile(filePath);
    await fs.writeFileSync(filePath, file.buffer);
    existingFile.imageUrl = filePath;
    const updatedTopic = await this.update(existingFile);
    return updatedTopic;
  }
}

class ArticleNode {
  private val;
  private left;
  private right;
  private count;
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.count = 0;
  };
};

export class ArticleBST {
  private root;
  constructor() {
    this.root = null;
  }
  create (val) {
    const newArticleNode = new ArticleNode(val);
    if (!this.root) {
      this.root = newArticleNode;
      return this;
    };
    let current = this.root;

    const addSide = side => {
      if (!current[side]) {
        current[side] = newArticleNode;
        return this;
      };
      current = current[side];
    };

    while (true) {
      if (val === current.val) {
        current.count++;
        return this;
      };
      if (val < current.val) addSide('left');
      else addSide('right');
    };
  };

  find (val) {
    if (!this.root) return undefined;
    let current = this.root,
        found = false;

    while (current && !found) {
      if (val < current.val) current = current.left;
      else if (val > current.val) current = current.right;
      else found = true;
    };

    if (!found) return 'Nothing Found!';
      return current;
  };

  breadthFirstSearch (start) {
    let data = [],
        queue = [],
        current = start ? this.find(start) : this.root;

    queue.push(current);
    while (queue.length) {
      current = queue.shift();
      data.push(current.val);

      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    };

    return data;
  }

  delete (val) {
    if (!this.root) return undefined;
    let current = this.root,
        parent;

    const pickSide = side => {
      if (!current[side]) return 'No node found!';

      parent = current;
      current = current[side];
    };

    const deleteNode = side => {
      if (current.val === val && current.count > 1) current.count--;
      else if (current.val === val) {
        const children = this.breadthFirstSearch(current.val);
        parent[side] = null;
        children.splice(0, 1);
        children.forEach(child => this.create(child));
      };
    };

    while (current.val !== val) {
      if (val < current.val) {
        pickSide('left');
        deleteNode('left');
      } else {
        pickSide('right');
        deleteNode('right');
      };
    };

    return current;
  }
};

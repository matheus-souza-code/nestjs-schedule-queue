import { InjectModel } from '@nestjs/sequelize';
import { Tweet } from './../entities/tweet.entity';
import { Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TweetsCountService {
  private limit = 10;
  constructor(
    @InjectModel(Tweet)
    private tweetModel: typeof Tweet,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Interval(5000)
  async countTweets() {
    console.log('procurando tweets');
    let offset: number = await this.cacheManager.get('tweet-offset');
    offset = offset === undefined ? 0 : offset;

    console.log(`offsets: ${offset}`);

    const tweets = await this.tweetModel.findAll({
      offset,
      limit: this.limit,
    });

    console.log(`${tweets.length} encontrados`);

    if (tweets.length === this.limit) {
      this.cacheManager.set('tweet-offset', offset + this.limit, 1000000);
      console.log(`achou + ${this.limit} tweets`);
    }
  }
}

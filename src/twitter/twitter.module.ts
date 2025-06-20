import { Module } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { TwitterController } from './twitter.controller';

@Module({
  providers: [TwitterService],
  controllers: [TwitterController],
  exports: [TwitterService],
})
export class TwitterModule {}
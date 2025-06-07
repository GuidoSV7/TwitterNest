import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { ScrapeTwitterDto, ValidateTwitterDto } from './dto/twitter.dto';

@Controller('twitter')
export class TwitterController {
  constructor(private readonly twitterService: TwitterService) {}

  @Post('scrape')
  async scrapeDescription(@Body() scrapeTwitterDto: ScrapeTwitterDto) {
    const { url } = scrapeTwitterDto;

    if (!this.twitterService.isValidTwitterUrl(url)) {
      throw new BadRequestException('Invalid Twitter/X URL');
    }

    try {
      const description = await this.twitterService.getTwitterDescription(url);
      return { description };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


@Post('validate')
  async validateTweet(@Body() validateTwitterDto: ValidateTwitterDto) {
    const { url, requiredItems } = validateTwitterDto;

    if (!this.twitterService.isValidTwitterUrl(url)) {
      throw new BadRequestException('Invalid Twitter/X URL');
    }

    if (!requiredItems || requiredItems.length === 0) {
      throw new BadRequestException('requiredItems array cannot be empty');
    }

    try {
      const result = await this.twitterService.validateTwitterContent(url, requiredItems);
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}


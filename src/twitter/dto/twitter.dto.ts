import { IsArray, IsString, IsUrl } from 'class-validator';

export class ScrapeTwitterDto {
  @IsString()
  @IsUrl()
  url: string;
}


export class ValidateTwitterDto {
  @IsString()
  @IsUrl()
  url: string;

  @IsArray()
  @IsString({ each: true })
  requiredItems: string[]; // Array con @mentions y #hashtags
}
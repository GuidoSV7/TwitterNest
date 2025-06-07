import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';


import { CommonModule } from './common/common.module';
import { TwitterModule } from './twitter/twitter.module';




@Module({
  imports: [


    ConfigModule.forRoot({isGlobal:true}),

    // TypeOrmModule.forRoot({
    //   ssl: process.env.STAGE === 'prod',
    //   extra: {
    //     ssl: process.env.STAGE === 'prod'
    //           ? { rejectUnauthorized: false }
    //           : null,
    //   },

    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: +process.env.DB_PORT,
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),
    
    TwitterModule,

  
    CommonModule,

   


  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

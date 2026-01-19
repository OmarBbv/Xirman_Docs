import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        // dropSchema: true, // ⚠️ Production-da heç vaxt true etməyin!

        // SSL Configuration for Supabase/Production
        // ssl: configService.get<string>('DB_HOST') !== 'localhost'
        //   ? { rejectUnauthorized: false }
        //   : false,

        // Connection pool settings
        // extra: {
        //   max: 10, // maximum number of connections
        //   connectionTimeoutMillis: 10000, // 10 seconds
        // },
      }),
    }),
  ],
})
export class DatabaseModule { }

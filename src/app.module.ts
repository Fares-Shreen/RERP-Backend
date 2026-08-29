import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EmployeeController } from './module/employee/employee.controller';
import { EmployeeService } from './module/employee/employee.service';
import { EmployeeModule } from './module/employee/employee.module';
import { AuthModule } from './module/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env.production', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DBURL'),
        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => console.log('connected'));
          connection.on('open', () => console.log('open'));
          connection.on('disconnected', () => console.log('disconnected'));
          connection.on('reconnected', () => console.log('reconnected'));
          connection.on('disconnecting', () => console.log('disconnecting'));
          return connection;
        },
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    EmployeeModule,AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
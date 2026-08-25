import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { winstonLogger } from './common/config/winston.config';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });


  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor<any>());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  app.use(helmet());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Restaurant ERP API')
    .setDescription('API documentation for internal staff and public e-commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
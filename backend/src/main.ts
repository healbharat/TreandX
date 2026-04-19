import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // production मध्ये specific domain देऊ शकतोस
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0'); // 🔥 IMPORTANT
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
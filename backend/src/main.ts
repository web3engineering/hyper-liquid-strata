import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: [
      'http://localhost:3005',
      'http://127.0.0.1:3005',
      'http://144.76.39.46:3005',
      'http://144.76.39.46',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`🚀 Backend server running on port ${port}`);
}
bootstrap();

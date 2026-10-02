import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Security
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }))

  // Compression
  app.use(compression())

  // Cookies
  app.use(cookieParser())

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      disableErrorMessages: process.env.NODE_ENV === 'production'
    })
  )

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Soundwave Fest 2026 API')
    .setDescription('API documentation for Soundwave Fest 2026 Event Management & Ticketing Platform')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth'
    )
    .addCookieAuth('refreshToken')
    .addTag('auth', 'Authentication endpoints')
    .addTag('events', 'Public event endpoints')
    .addTag('orders', 'Order & checkout endpoints')
    .addTag('payments', 'Payment endpoints')
    .addTag('tickets', 'E-Ticket endpoints')
    .addTag('check-in', 'Check-in & scanner endpoints')
    .addTag('admin', 'Admin management endpoints')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha'
    }
  })

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`🚀 Soundwave Fest API running on http://localhost:${port}`)
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`)
}

bootstrap()
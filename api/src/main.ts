// ===========================================
// Point d'entrée de l'application
// ===========================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurité
  app.use(helmet());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Versioning API
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('Thé Tip Top API')
    .setDescription(
      `
      API pour le jeu-concours Thé Tip Top.
      
      ## Fonctionnalités
      
      - **Authentification** : Inscription, connexion (classique + OAuth2 Google/Facebook)
      - **Participation** : Validation des codes tickets et attribution des gains
      - **Gains** : Historique et remise des lots
      - **Statistiques** : Tableau de bord administrateur
      - **Tirage au sort** : Grand prix annuel
      
      ## Rôles
      
      - **CLIENT** : Peut participer et voir ses gains
      - **EMPLOYEE** : Peut valider et remettre les lots en boutique
      - **ADMIN** : Accès complet aux statistiques et fonctionnalités admin
    `,
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentification et gestion des comptes')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('tickets', 'Gestion des tickets/codes')
    .addTag('participations', 'Participation au jeu-concours')
    .addTag('gains', 'Gestion et remise des gains')
    .addTag('stats', 'Statistiques du jeu-concours')
    .addTag('grand-prize', 'Tirage au sort du grand prix')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entrez votre token JWT',
      },
      'JWT-auth',
    )
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: `${process.env.API_URL}/api/v1/auth/google`,
          tokenUrl: `${process.env.API_URL}/api/v1/auth/google/callback`,
          scopes: {
            email: 'Accès à votre email',
            profile: 'Accès à votre profil',
          },
        },
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Thé Tip Top - API Documentation',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
🍵 Thé Tip Top API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 API running on: http://localhost:${port}
📚 Swagger docs:   http://localhost:${port}/api/docs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

bootstrap();

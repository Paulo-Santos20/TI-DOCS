import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TI Docs API',
      version: '1.0.0',
      description: 'API de gerenciamento de documentos do TI Docs',
    },
    servers: [{ url: '/api', description: 'API server' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.routes.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)

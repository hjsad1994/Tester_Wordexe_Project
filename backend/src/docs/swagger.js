const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Fullstack App API',
    version: '1.0.0',
    description: 'API documentation for the Fullstack Application',
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);

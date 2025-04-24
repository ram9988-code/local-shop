const swaggerAutogen = require('swagger-autogen');

const doc = {
  info: {
    title: 'Auth Service API',
    description: 'API documentation for the Auth Service',
    Version: '1.0.0',
  },
  host: 'localhost:6001',
  schemes: ['http'],
};

const outputFile = './swagger_output.json';

const endpoints = ['./routes/auth.route.ts'];

swaggerAutogen(outputFile, endpoints, doc);

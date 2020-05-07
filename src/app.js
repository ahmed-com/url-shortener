const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const serveStatic = require('serve-static');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const mainRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();

app.use(bodyParser.json());
app.use('/', mainRouter);
app.use('/api', apiRouter);

app.use('/', serveStatic(__dirname + '/client'));

// OpenAPI 3 docs
app.use(
  '/api/docs',
  swaggerUI.serve,
  swaggerUI.setup(
    swaggerJsDoc({
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'URL Shortener',
          version: '1.0.0',
          description: 'This is a url shortener',
        },
        servers: [
          {
            url: `${process.env.BASEURL}/api`,
            description: 'version 1 of url shortener api',
          },
        ],
      },
      apis: ['src/routes/*.js'],
    })
  )
);

(async function connectDB(url) {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('connected to mongo');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})(process.env.MONGOURI);

module.exports = app;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const mainRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();

app.use(bodyParser.json());
app.use('/',mainRouter);
app.use('/api',apiRouter);

(async function connectDB(url){
    try{
        await mongoose.connect(url,{useNewUrlParser : true, useUnifiedTopology: true});
        console.log('connected to mongo');
    }catch(err){
        console.error(err.message);
        process.exit(1);
    }
})(process.env.MONGOURI);

module.exports = app;
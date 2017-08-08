const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Bing = require('node-bing-api')({ accKey: 'a0d5e268c56a474c8f3b0ca0cfd3485a' }); //Insert Bing Web Search API key here
const searchTerm = require('./models/searchTerm'); //Display-model for each search
const express = require('express');
const app = express();


//Middleware
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/searchTerms');

//Get all search terms from the database
app.get('/api/recentsearches', (req, res, next) => {
   searchTerm.find({}, (err, data) => {
       if (err) console.error(err);
       
       res.json(data);
   });
});


//GET call for an image search
app.get('/api/imagesearch/:searchVal*', (req, res, next) => {
   var searchVal = req.params;
   var offset = req.query;
   
   var data = new searchTerm({
       searchVal,
       searchDate: new Date()
   });
   
   //Save to searchTerm collection
   data.save((err) => {
       if (err) {
           res.send('Error saving to database');
       }
   });
   
   var searchOffset;
   //Does offset exist?
   if (offset) {
       if (offset === 1) {
           offset = 0;
           searchOffset = 1;
           
       } else if (offset > 1) {
           searchOffset = offset + 1;
       }
   }
   
   Bing.images(searchVal, {
       top: 10 * searchOffset,
       skip: 10 * offset
   }, (error, imageRes, body) => {
       var bingData = [];
       
       for (var i = 0; i < 10; i++) {
           bingData.push({
               url: body.value[i].webSearchUrl,
               snippet: body.value[i].name,
               thumbnail: body.value[i].thumbnailUrl,
               context: body.value[i].hostPageDisplayUrl
           });
       }
       
       res.json(bingData);
   });
});




//process.env.PORT is for when we deploy the application to Heroku; port 3000 for when we work locally
app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running');
});


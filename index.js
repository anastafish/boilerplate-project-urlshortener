require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dns = require('node:dns');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const urlSchema = new mongoose.Schema({
  original_url:String,
  short_url:Number
})

const Urls = mongoose.model('Urls', urlSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended:false}))

app.post('/api/shorturl', (req, res) => {
  dns.lookup(req.body.url.slice(8), err => {
    if (err){
      res.json({ error: 'invalid url' })
    }
    else if (req.body.url.slice(0,7) === 'http://') {
      Urls.count({}).then(data => {
        const newUrl = new Urls({
          original_url: req.body.url,
          short_url: data
        })
    
        newUrl.save().then(data => {
          res.json({
            original_url: data.original_url,
            short_url: data.short_url
          })
        }).catch(err => {
          console.log(err)
        })
    
      }).catch(err => console.log(err))   
    }
    else {
      res.json({ error: 'invalid url' })
    }
  })   
})

app.get('/api/shorturl/:short_url', (req, res) => {
  Urls.findOne({short_url:req.params.short_url}).then(data => {
    res.redirect(data.original_url)
  }).catch(err => console.log(err))
  })

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

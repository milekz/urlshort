const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { nanoid } = require('nanoid');
//const http = require("http");





const port = process.env.PORT || 3000
const monkuri= process.env.DBURI || '127.0.0.1:27017/short'

const app = express()
//app.enable('trust proxy');
//app.use(helmet());
//app.use(morgan('common'));
app.use(express.json());
app.use(express.static('./public'));

const notFoundPath = path.join(__dirname, 'public/404.html');
//const indexPath = path.join(__dirname, 'public/index.html');


const db = monk(monkuri );
const urls = db.get('urls');


app.get('/:id', async (req, res, next) => {
  //console.log(req.params)
  if ( req.params.id==='stats' ) {
    console.log('Total entries' , await urls.count() )
  }
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({ slug });
    if (url) {
      console.log(url)
      urls.update({ slug }, { $inc: { count: 1 } }  );
      return res.redirect(url.url);
    }
    return res.status(404).sendFile(notFoundPath);
  } catch (error) {
    console.log(error);
    return res.status(404).sendFile(notFoundPath);
  }
});



const schema = yup.object().shape({
  slug: yup.string().trim().matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required(),
  count: yup.number().positive(),
});


app.post('/urladd',  async (req, res, next) => {
  let { slug, url } = req.body;

  try {
    await schema.validate({
      slug,
      url,
    });
    if (url.includes('mydomain....')) {
      throw new Error('Stop it.');
    }
    if (!slug) {
      slug = nanoid(10);
    }

   // else {
//      const existing = await urls.findOne({ slug });
//      if (existing) {
//        throw new Error('Slug in use.');
//      }
//    }
//    slug = slug.toLowerCase();
    const newUrl = {
      url,
      slug,
      "count":0
    };
    console.log(newUrl);
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    next(error);
  }
});



// app.get('/', async (req, res) => {
//   res.send('Hello World!')
//   console.log('Total entries'   )
//   return res.status(201).sendFile(indexPath);
// })




// app.get('/stats', (req, res) => {
//   //res.send('Hello World!')
 
//   return res.status(200).sendFile(indexPath);
// })




var server = app.listen(port,  () => {
  console.log(`Example app listening on port ${port}  mongo URI ${monkuri}`)
})

//server.keepAliveTimeout = 30 * 1000;
//server.headersTimeout = 35 * 1000;



//const server = http.createServer({}, app).listen(3000);
// This is the important stuff
//server.keepAliveTimeout = (60 * 1000) + 1000;
//server.headersTimeout = (60 * 1000) + 2000;




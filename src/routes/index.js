const router = require('express').Router();
const moment = require('moment');

const Url = require('../models/Url');

// @route       GET /:urlCode
// @desc        redirects to the longUrl
router.get('/:id', async function redirect(req, res) {
  try {
    const { id } = req.params;
    const document = await Url.findById(id);
    if (document) {
      res.redirect(document.longUrl);
      setImmediate(()=> {
        incrementHits(document)
        document.save().then((doc) => console.log('saved hit for doc', doc._id));
      });
      return;
    } else {
      return res.status(404).json('Not Found !');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('SOMETHING WENT WRONG');
  }
});

function incrementHits(document){
  let found = false;
  document.hits.forEach(hit => {
    if(hit.date ===  moment(Date.now()).format(`YYYY-MM-DD`)){
      found = true;
      hit.hitCount++;
    }
  });
  if(!found) document.hits.push({date : moment(Date.now()).format(`YYYY-MM-DD`), hitCount : 1});
}

module.exports = router;

const router = require('express').Router();

const Url = require('../models/Url');

// @route       GET /:urlCode
// @desc        redirects to the longUrl
router.get('/:id', async function redirect(req, res) {
  try {
    const { id } = req.params;
    const document = await Url.findById(id);
    if (document) {
      document.save().then((doc) => console.log('saved hit for doc', doc._id));
      return res.redirect(document.longUrl);
    } else {
      return res.status(404).json('Not Found !');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('SOMETHING WENT WRONG');
  }
});

module.exports = router;

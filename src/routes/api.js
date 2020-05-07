const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const shortId = require('shortid');

const Url = require('../models/Url');

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     Url:
 *       type: object
 *       required:
 *         - longUrl
 *       properties:
 *         id:
 *           type: string
 *         longUrl:
 *           type: string
 *         hits:
 *             type: integer
 *             format: int64
 *         date:
 *             type: string
 *             format: date-time
 */

/**
 * @swagger
 *
 * /url/:id:
 *   get:
 *     description: get a url by id
 *     tags:
 *       - url
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: get url by id
 *         schema:
 *           type: object
 *           items:
 *             $ref: '#/components/schemas/Url'
 */
router.get('/url/:id', async (req, res, next) => {
  try {
    const document = await Url.findById(req.params.id);

    res.send({
      ...document._doc,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json('SOMETHING WENT WRONG');
  }
});

/**
 * @swagger
 *
 * /url/shorten/:
 *   post:
 *     description: Create a short url
 *     tags:
 *       - url
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Url
 *         description: a url to shorten
 *         in: body
 *         type: string
 *         schema:
 *           $ref: '#/components/schemas/Url'
 *     responses:
 *       '201':
 *         description: created Url
 *       default:
 *         description: new Url
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Url"
 */
router.post(
  '/url/shorten',
  check('longUrl').isURL().withMessage('Please Enter A Valid Url'),
  validate,
  shorten
);

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Validation Failed',
      data: errors.array(),
    });
  } else {
    next();
  }
}

async function shorten(req, res, next) {
  try {
    const { longUrl } = req.body;
    const baseUrl = process.env.BASEURL;
    let document = await Url.findOne({ longUrl });

    if (document) {
      const shortUrl = `${baseUrl}/${document._id}`;
      const { hits, date, _id } = document;
      res.json({ _id, longUrl, shortUrl, hits, date });
    } else {
      const _id = shortId.generate();
      const date = new Date();
      await new Url({ _id, longUrl, date }).save();
      const shortUrl = `${baseUrl}/${_id}`;
      res.json({ longUrl, shortUrl, date });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('SOMETHING WENT WRONG');
  }
}

module.exports = router;

const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const shortId = require('shortid');

const Url = require('../models/Url');

// @route       POST /api/url/shorten
// @desc        Creates the short url
router.post('/url/shorten',
    check('longUrl')
    .isURL()
    .withMessage('Please Enter A Valid Url'),
    validate,
    shorten
);

function validate(req,res,next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(422).json({
            message : 'Validation Failed',
            data : errors.array()
        })
    }else{
        next();
    }
}

async function shorten(req,res,next){
    try{
        const {longUrl} = req.body;
        const baseUrl = process.env.BASEURL;
        let document = await Url.findOne({longUrl});

        if(document){
            const shortUrl = `${baseUrl}/${document._id}`;
            const date = document.date;
            res.json({longUrl,shortUrl,date})
        }else{
            const _id = shortId.generate();
            const date = new Date();
            await new Url({ _id, longUrl, date }).save();
            const shortUrl = `${baseUrl}/${_id}`;
            res.json({longUrl,shortUrl,date});
        }
    }catch(err){
        console.error(err);
        res.status(500).json('SOMETHING WENT WRONG');
    }
}

module.exports = router;
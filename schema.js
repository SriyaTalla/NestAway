const joi = require("joi");
const review = require("./models/review");

const listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        country: joi.string().required(),
        location: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.object({
            filename: joi.string().allow("", null),
            url: joi.string().allow("", null)
        })
    }).required()
}).required();


const reviewSchema = joi.object({
    review : joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required()
    }).required()
}).required();

module.exports = { listingSchema, reviewSchema };
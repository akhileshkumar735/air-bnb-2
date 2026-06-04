const joi = require("joi");

module.exports.listingSchema = joi.object({
    listing: joi.object({
      title: joi.object({
        en: joi.string().required(),
        hi: joi.string().allow("", null).optional(),
        fr: joi.string().allow("", null).optional(),
        es: joi.string().allow("", null).optional()
      }).required(),
      description: joi.object({
        en: joi.string().required(),
        hi: joi.string().allow("", null).optional(),
        fr: joi.string().allow("", null).optional(),
        es: joi.string().allow("", null).optional()
      }).required(),
      amenities: joi.object({
        en: joi.string().allow("", null).optional(),
        hi: joi.string().allow("", null).optional(),
        fr: joi.string().allow("", null).optional(),
        es: joi.string().allow("", null).optional()
      }).optional(),
      houseRules: joi.object({
        en: joi.string().allow("", null).optional(),
        hi: joi.string().allow("", null).optional(),
        fr: joi.string().allow("", null).optional(),
        es: joi.string().allow("", null).optional()
      }).optional(),
      locationDescription: joi.object({
        en: joi.string().allow("", null).optional(),
        hi: joi.string().allow("", null).optional(),
        fr: joi.string().allow("", null).optional(),
        es: joi.string().allow("", null).optional()
      }).optional(),
      location: joi.string().required(),
      country: joi.string().required(),
      price: joi.number().required().min(0),
      image: joi.object({
        filename: joi.string().allow("", null),
        url: joi.string().allow("", null)
      }).allow(null).optional()
    }).required()
  });

module.exports.reviewschema = joi.object({
    review : joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required()
    }).required()
})
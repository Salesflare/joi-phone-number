'use strict';

const libphonenumber = require('google-libphonenumber');
const PhoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const PhoneNumberFormat = libphonenumber.PhoneNumberFormat;

const internals = {};

/**
 * Allows you to do `Joi.string().phoneNumber()`
 *
 * @param {Object} joi Joi instance provided by Joi
 * @return {Object} Joi plugin object
 */
module.exports = joi => ({
  base: joi.string(),
  name: 'string',
  language: {
    phonenumber: 'did not seem to be a phone number'
  },
  rules: [{
    name: 'phoneNumber',
    params: {
      opts: joi.object().keys({
        /**
         * We will use the specified country code or 'US', with fallback 'BE', if no
         * country code provided in phone number (0494...).
         * Numbers with country code (+3249...) will use the data from the number and not the default.
         */
        defaultCountry: joi.array().items(joi.string()).single(),
        format: joi.string().only('e164', 'international', 'national', 'rfc3966'),
        strict: joi.boolean()
      }).default({defaultCountry: ['US', 'BE'], strict: false}).min(1)
    },
    validate(params, value, state, options) {
      try {
        const proto = internals.parse(value, params.opts.defaultCountry);

        if (params.opts.strict && !PhoneUtil.isValidNumber(proto)) {
          throw new Error('StrictPhoneNumber');
        }

        if (!options.convert || !params.opts.format) {
          return value;
        }

        const format = PhoneNumberFormat[params.opts.format.toUpperCase()];
        return PhoneUtil.format(proto, format);
      } catch (err) {
        const knownErrors = ['Invalid country calling code', 'The string supplied did not seem to be a phone number', 'StrictPhoneNumber'];
        // We ignore the next line for line coverage since we should always hit it but if we have a regression in our code we still want to surface that instead of just returning the default error
        /* istanbul ignore next */
        if (knownErrors.includes(err.message)) {
          // Generate an error, state and options need to be passed
          return this.createError('string.phonenumber', {value}, state, options);
        }

        /* istanbul ignore next */
        throw err;
      }
    }
  }]
});

/**
 *
 * @param {String} value input
 * @param {Array<String>} countries countries to try and parse with
 * @returns {Object} parse result
 *
 * @throws {Error} throws when input isn't valid
 */
internals.parse = (value, [...countries] = []) => {
  const country = countries.shift();
  try {
    return PhoneUtil.parse(value, country);
  } catch (error) {
    if (countries.length > 0) {
      return internals.parse(value, countries);
    }

    throw error;
  }
};

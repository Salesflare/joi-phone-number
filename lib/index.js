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
module.exports = joi => {
  const opts = joi.object().keys({
    /**
     * We will use the specified country code or 'US', with fallback 'BE', if no
     * country code provided in phone number (0494...).
     * Numbers with country code (+3249...) will use the data from the number and not the default.
     */
    defaultCountry: joi.array().items(joi.string()).single(),
    format: joi.string().valid('e164', 'international', 'national', 'rfc3966')
  }).default({defaultCountry: ['US', 'BE']}).min(1);

  return {
    type: 'string',
    base: joi.string(),
    messages: {
      'string.phonenumber': '"{{#label}}" did not seem to be a phone number'
    },
    rules: {
      phoneNumber: {
        method(options) {
          options = joi.attempt(options, opts);
          return this.$_addRule({name: 'phoneNumber', args: {options}});
        },
        validate(value, {error, prefs}, {options}) {
          try {
            const proto = internals.parse(value, options.defaultCountry);
            if (!prefs.convert || !options.format) {
              return value;
            }

            const format = PhoneNumberFormat[options.format.toUpperCase()];
            return PhoneUtil.format(proto, format);
          } catch (err) {
            const knownErrors = ['Invalid country calling code', 'The string supplied did not seem to be a phone number'];
            // We ignore the next line for line coverage since we should always hit it but if we have a regression in our code we still want to surface that instead of just returning the default error
            /* istanbul ignore next */
            if (knownErrors.includes(err.message)) {
              // Generate an error, state and options need to be passed
              return error('string.phonenumber');
            }

            /* istanbul ignore next */
            throw err;
          }
        }
      }
    }
  };
};

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

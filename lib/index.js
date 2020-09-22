'use strict';

const LibPhoneNumber = require('google-libphonenumber');
const PhoneUtil = LibPhoneNumber.PhoneNumberUtil.getInstance();
const PhoneNumberFormat = LibPhoneNumber.PhoneNumberFormat;
const LibPhoneNumberError = LibPhoneNumber.Error;

const internals = {};

/**
 * Allows you to do `Joi.string().phoneNumber()`
 *
 * @param {Object} joi Joi instance provided by Joi
 * @return {Object} Joi plugin object
 */
module.exports = joi => {
  return {
    base: joi.string(),
    type: 'string',
    messages: {
      'phoneNumber.invalid': '"{{#label}}" did not seem to be a phone number'
    },
    rules: {
      phoneNumber: {
        /**
         * We will use the specified country code or 'US', with fallback 'BE', if no
         * country code provided in phone number (0494...).
         * Numbers with country code (+3249...) will use the data from the number and not the default.
         */
        method({defaultCountry, strict, format} = {defaultCountry: ['US', 'BE']}) {
          return this.$_addRule({name: 'phoneNumber', args: {defaultCountry, strict, format}});
        },
        args: [
          {
            name: 'defaultCountry',
            ref: true,
            assert: joi.alternatives().try(joi.array().items(joi.string()), joi.string())
          },
          {
            name: 'strict',
            ref: true,
            assert: joi.boolean()
          },
          {
            name: 'format',
            ref: true,
            assert: joi.valid('e164', 'international', 'national', 'rfc3966')
          }
        ],
        validate(value, {prefs, error}, args) {
          try {
            // It seems that a `.single` is not doing a convert when used in `args.assert` so we do it here manually
            const countries = (Array.isArray(args.defaultCountry) || !args.defaultCountry) ? args.defaultCountry : [args.defaultCountry];

            const proto = internals.parse(value, countries);

            if (args.strict && !PhoneUtil.isValidNumber(proto)) {
              throw new Error('StrictPhoneNumber');
            }

            if (!prefs.convert || !args.format) {
              return value;
            }

            const format = PhoneNumberFormat[args.format.toUpperCase()];
            value = PhoneUtil.format(proto, format);
            return value;
          } catch (err) {
            const knownErrors = [...Object.values(LibPhoneNumberError), 'StrictPhoneNumber'];
            // We ignore the next line for line coverage since we should always hit it but if we have a regression in our code we still want to surface that instead of just returning the default error
            /* istanbul ignore next */
            if (knownErrors.includes(err.message)) {
              // Generate an error
              return error('phoneNumber.invalid');
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

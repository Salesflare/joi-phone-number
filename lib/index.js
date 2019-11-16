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
  type: 'phoneNumber',
  messages: {
    'phoneNumber.invalid': '"{{#label}}" did not seem to be a phone number'
  },
  validate(value, helpers) {
    const schema = helpers.schema;
    /**
     * We will use the specified country code or 'US', with fallback 'BE', if no
     * country code provided in phone number (0494...).
     * Numbers with country code (+3249...) will use the data from the number and not the default.
     */
    const defaultCountry = schema.$_getFlag('defaultCountry') || ['US', 'BE'];
    const formatName = schema.$_getFlag('format') || 'e164';
    const strict = schema.$_getFlag('strict') || false;

    // Validate arguments
    if (typeof formatName !== 'string' || ['e164', 'international', 'national', 'rfc3966'].indexOf(formatName) === -1) {
      throw new Error('Invalid option given for format: must be one of [e164, international, national, rfc3966]');
    }

    if (!Array.isArray(defaultCountry) || !defaultCountry.every(i => (typeof i === 'string'))) {
      throw new Error('Invalid option given for defaultCountry');
    }

    try {
      const proto = internals.parse(value, defaultCountry);

      if (strict && !PhoneUtil.isValidNumber(proto)) {
        throw new Error('StrictPhoneNumber');
      }

      if (!helpers.prefs.convert) {
        return {value};
      }

      const format = PhoneNumberFormat[formatName.toUpperCase()];
      value = PhoneUtil.format(proto, format);
      return {value};
    } catch (err) {
      const knownErrors = ['Invalid country calling code', 'The string supplied did not seem to be a phone number', 'StrictPhoneNumber'];
      // We ignore the next line for line coverage since we should always hit it but if we have a regression in our code we still want to surface that instead of just returning the default error
      /* istanbul ignore next */
      if (knownErrors.includes(err.message)) {
        // Generate an error
        return {value, errors: helpers.error('phoneNumber.invalid')};
      }

      /* istanbul ignore next */
      throw err;
    }
  },
  rules: {
    defaultCountry: {
      alias: 'defaultCountries',
      method(country) {
        if (typeof country === 'string') {
          return this.$_setFlag('defaultCountry', [country]);
        }

        return this.$_setFlag('defaultCountry', country);
      }
    },
    strictValidation: {
      method() {
        return this.$_setFlag('strict', true);
      }
    },
    format: {
      method(format) {
        return this.$_setFlag('format', format);
      }
    }
  }
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

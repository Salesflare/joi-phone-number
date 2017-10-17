'use strict';

const libphonenumber = require('google-libphonenumber');
const PhoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const PhoneNumberFormat = libphonenumber.PhoneNumberFormat;

/**
 * Allows you to do `Joi.string().phoneNumber()`
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
      /**
       * We will use specified country code (phoneNumber('BE')) or 'US' if no
       * country code provided in phone number (0494...). Numbers with country
       * code (+3249...) will use the data from the number and not the default.
       */
      defaultCountry: joi.string().default('US'),
      format: joi.only('e164', 'international', 'national', 'rfc3966')
    },
    validate(params, value, state, options) {
      try {
        const proto = PhoneUtil.parse(value, params.defaultCountry);
        if (!params.format) {
          return value;
        }

        const format = getFormat(params.format);
        return PhoneUtil.format(proto, format);
      } catch (err) {
        // Generate an error, state and options need to be passed
        return this.createError('string.phonenumber', {value}, state, options);
      }
    }
  }]
});

function getFormat(format) {
  switch (format) { // eslint-disable-line default-case
    case 'e164': return PhoneNumberFormat.E164;
    case 'international': return PhoneNumberFormat.INTERNATIONAL;
    case 'national': return PhoneNumberFormat.NATIONAL;
    case 'rfc3966': return PhoneNumberFormat.RFC3966;
  }
}

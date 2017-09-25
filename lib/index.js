'use strict';

const PhoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

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
    validate(params, value, state, options) {
      try {
        /**
         * FUTURE
         * If no country code is provided (0494...) assume it is a US number
         * Which is not super correct but we don't know the country of the user atm
         * Numbers with country code (+3249...) will use the data from the number and not the 'US' default
         */
        PhoneUtil.parse(value, 'US');

        return value;
      } catch (err) {
        // Generate an error, state and options need to be passed
        return this.createError('string.phonenumber', {value}, state, options);
      }
    }
  }]
});

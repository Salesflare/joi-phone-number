'use strict';

const Libphonenumber = require('google-libphonenumber');

const PhoneUtil = Libphonenumber.PhoneNumberUtil.getInstance();
const PhoneNumberFormat = Libphonenumber.PhoneNumberFormat;
const supportedRegionCodes = PhoneUtil.getSupportedRegions();

const internals = {};

/**
 * Allows you to do `Joi.string().phoneNumber()`
 *
 * @param {Object} joi Joi instance provided by Joi
 * @return {Object} Joi plugin object
 */
module.exports = (joi) => ({
    base: joi.string(),
    type: 'string',
    rules: {
        phoneNumber: {
            method(params) {

                return this.$_addRule({ name: 'phoneNumber', args: { params } });
            },
            args: [
                {
                    name: 'params',
                    ref: true,
                    assert: joi.object().keys({
                        defaultCountry: joi.array().items(joi.string().valid(...supportedRegionCodes)).single(),
                        format: joi.string().valid('e164', 'international', 'national', 'rfc3966'),
                        strict: joi.boolean()
                    })
                }
            ],
            validate(value, helpers, args) {

                const params = Object.assign({ defaultCountry: ['US', 'BE'], strict: false }, args.params);

                try {

                    const proto = internals.parse(value, typeof params.defaultCountry === 'string' ? [params.defaultCountry] : params.defaultCountry);

                    if (params.strict && !PhoneUtil.isValidNumber(proto)) {

                        return helpers.error('phoneNumber.nonStrict', { regionCode: PhoneUtil.getRegionCodeForNumber(proto) });

                    }

                    if (!helpers.prefs.convert || !params.format) {
                        return value;
                    }

                    const format = PhoneNumberFormat[params.format.toUpperCase()];

                    return PhoneUtil.format(proto, format);

                }
                catch (e) {
                    return helpers.error('phoneNumber.invalid');
                }

            }
        }
    },
    messages: {
        'phoneNumber.invalid': '"{{#label}}" did not seem to be a phone number',
        'phoneNumber.nonStrict': '"{{#label}}" does not match pattern of region code "{{#regionCode}}" phone number'
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
    }
    catch (error) {

        if (countries.length > 0) {
            return internals.parse(value, countries);
        }

        throw error;
    }
};

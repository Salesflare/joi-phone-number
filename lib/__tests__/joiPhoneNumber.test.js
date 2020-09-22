'use strict';

const Joi = require('joi');
const JoiPhoneNumber = require('../index.js');

describe('joiPhoneNumber', () => {
  it('extends', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    expect(joi.string().phoneNumber).toBeInstanceOf(Function);
  });

  it('validates', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    let schema = joi.string().phoneNumber();

    expect(schema.validate('').error).toBeInstanceOf(Error);
    expect(schema.validate(' ').error).toBeInstanceOf(Error);
    expect(schema.validate('1').error).toBeInstanceOf(Error);
    expect(schema.validate('aa').error).toBeInstanceOf(Error);
    expect(schema.validate(1).error).toBeInstanceOf(Error);
    expect(schema.validate(123456).error).toBeInstanceOf(Error);
    expect(schema.validate(null).error).toBeInstanceOf(Error);
    expect(schema.validate({}).error).toBeInstanceOf(Error);

    expect(schema.validate(undefined).error).toBeUndefined();
    expect(schema.validate('123').error).toBeUndefined();
    expect(schema.validate('+32494555890').error).toBeUndefined();
    expect(schema.validate('494322456').error).toBeUndefined();
    expect(schema.validate('011 69 37 83').error).toBeUndefined(); // Should work with the BE fallback

    schema = joi.string().phoneNumber({format: 'international'});
    expect(schema.validate('+324').error).toBeInstanceOf(Error);
  });

  it('formats', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    let schema = joi.string().phoneNumber({defaultCountry: 'BE', format: 'e164'});
    expect(schema.validate('494322456').value).toBe('+32494322456');

    schema = joi.string().phoneNumber({defaultCountry: 'BE', format: 'international'});
    expect(schema.validate('494322456').value).toBe('+32 494 32 24 56');

    schema = joi.string().phoneNumber({defaultCountry: 'BE', format: 'national'});
    expect(schema.validate('494322456').value).toBe('0494 32 24 56');

    schema = joi.string().phoneNumber({defaultCountry: 'BE', format: 'rfc3966'});
    expect(schema.validate('494322456').value).toBe('tel:+32-494-32-24-56');

    schema = joi.string().phoneNumber({defaultCountry: 'BE', format: 'rfc3966'});
    expect(schema.validate('494322456', {convert: false}).value).toBe('494322456');

    schema = joi.string().phoneNumber({defaultCountry: 'BE', format: 'rfc3966'});
    expect(schema.validate('494322456', {convert: false}).value).toBe('494322456');
  });

  it('formats with reference', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    let schema = joi.string().phoneNumber({defaultCountry: Joi.ref('$country'), format: 'e164'});
    expect(schema.validate('494322456', {context: {country: 'BE'}}).value).toBe('+32494322456');

    schema = joi.string().phoneNumber({defaultCountry: Joi.ref('$country'), format: 'international'});
    expect(schema.validate('494322456', {context: {country: 'BE'}}).value).toBe('+32 494 32 24 56');

    schema = joi.string().phoneNumber({defaultCountry: Joi.ref('$country'), format: 'national'});
    expect(schema.validate('494322456', {context: {country: 'BE'}}).value).toBe('0494 32 24 56');

    schema = joi.string().phoneNumber({defaultCountry: Joi.ref('$country'), format: 'rfc3966'});
    expect(schema.validate('494322456', {context: {country: 'BE'}}).value).toBe('tel:+32-494-32-24-56');

    schema = joi.string().phoneNumber({defaultCountry: Joi.ref('$country'), format: 'rfc3966'});
    expect(schema.validate('494322456', {convert: false, context: {country: 'BE'}}).value).toBe('494322456');

    schema = joi.string().phoneNumber({defaultCountry: Joi.ref('$country'), format: 'rfc3966'});
    expect(schema.validate('494322456', {convert: false, context: {country: 'BE'}}).value).toBe('494322456');
  });

  it('strict validates', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const strictSchema = joi.string().phoneNumber({defaultCountry: 'US', strict: true});
    const notStrict = joi.string().phoneNumber({defaultCountry: 'US'});

    expect(strictSchema.validate('7777777777').error).toBeInstanceOf(Error);
    expect(strictSchema.validate('7777777777').error.name).toEqual('ValidationError');
    expect(notStrict.validate('7777777777').error).toBeUndefined();

    expect(strictSchema.validate('1234567890').error).toBeInstanceOf(Error);
    expect(strictSchema.validate('1234567890').error.name).toEqual('ValidationError');
    expect(notStrict.validate('1234567890').error).toBeUndefined();
  });

  it('validates and formats without a country', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.string().phoneNumber({format: 'e164'});

    expect(schema.validate('32494322456').error).toBeInstanceOf(Error);
    expect(schema.validate('+32494322456').error).toBeUndefined();
  });

  it('should take multiple countries', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.string().phoneNumber({defaultCountry: ['US', 'BE']});
    expect(schema.validate('011 999 7083').value).toBe('011 999 7083');
  });

  it('should not convert when strict is true', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.string().phoneNumber({strict: true});
    expect(schema.validate('011 999 7083').value).toBe('011 999 7083');
  });

  it('errors on wrong format options', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    expect(() => {
      const schema = joi.string().phoneNumber({defaultCountry: 1});
      schema.validate('011 999 7083');
    }).toThrow('"defaultCountry" must be one of [array, string] or reference');
  });

  it('errors on wrong format options', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    expect(() => {
      const schema = joi.string().phoneNumber({format: 'ppp'});
      schema.validate('011 999 7083');
    }).toThrow('"format" must be one of [e164, international, national, rfc3966] or reference');
  });

  it('errors on wrong format options as reference', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.string().phoneNumber({format: Joi.ref('$format')});

    expect(schema.validate('011 999 7083', {context: {format: 'qqq'}}).error).toBeInstanceOf(Error);
  });
});

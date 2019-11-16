'use strict';

const Joi = require('@hapi/joi');
const JoiPhoneNumber = require('../index.js');

describe('joiPhoneNumber', () => {
  it('extends', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    expect(joi.phoneNumber).toBeInstanceOf(Function);
  });

  it('validates', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.phoneNumber();
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
  });

  it('formats', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    let schema = joi.phoneNumber().format('e164').defaultCountry('BE');
    expect(schema.validate('494322456').value).toBe('+32494322456');

    schema = joi.phoneNumber().format('international').defaultCountry('BE');
    expect(schema.validate('494322456').value).toBe('+32 494 32 24 56');

    schema = joi.phoneNumber().format('national').defaultCountry('BE');
    expect(schema.validate('494322456').value).toBe('0494 32 24 56');

    schema = joi.phoneNumber().format('rfc3966').defaultCountry('BE');
    expect(schema.validate('494322456').value).toBe('tel:+32-494-32-24-56');

    schema = joi.phoneNumber().format('rfc3966').defaultCountry('BE');
    expect(schema.validate('494322456', {convert: false}).value).toBe('494322456');

    schema = joi.phoneNumber().format('rfc3966').defaultCountry('BE');
    expect(schema.validate('494322456', {convert: false}).value).toBe('494322456');
  });

  it('strict validates', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const strict = joi.phoneNumber().defaultCountry('US').strictValidation();
    const notStrict = joi.phoneNumber().defaultCountry('US');
    const numbers = ['7777777777', '1234567890'];

    for (const number of numbers) {
      expect(strict.validate(number).error.name).toEqual('ValidationError');
      expect(notStrict.validate(number).error).toBeUndefined();
    }
  });

  it('validates and formats without a country', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.phoneNumber().format('e164').defaultCountry([]);

    expect(schema.validate('32494322456').error).toBeInstanceOf(Error);
    expect(schema.validate('+32494322456').error).toBeUndefined();
  });

  it('should take multiple countries', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.phoneNumber().defaultCountries(['US', 'BE']);
    expect(schema.validate('011 999 7083').value).toBe('+32119997083');
  });

  it('should not convert when strict is true', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.phoneNumber().strict();
    expect(schema.validate('011 999 7083').value).toBe('011 999 7083');
  });

  it('errors on wrong defaultCountry option', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    expect(() => {
      const schema = joi.phoneNumber().defaultCountry(1);
      schema.validate('011 999 7083');
    }).toThrow('Invalid option given for defaultCountry');
  });

  it('errors on wrong format options', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    expect(() => {
      const schema = joi.phoneNumber().format('ppp');
      schema.validate('011 999 7083');
    }).toThrow('Invalid option given for format: must be one of [e164, international, national, rfc3966]');
  });
});

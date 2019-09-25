'use strict';

const Joi = require('@hapi/joi');
const JoiPhoneNumber = require('../index.js');

describe('joiPhoneNumber', () => {
  it('extends', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    expect(joi.string().phoneNumber).toBeInstanceOf(Function);
  });

  it('validates', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.string().phoneNumber();

    expect(schema.validate('').error).toBeInstanceOf(Error);
    expect(schema.validate(' ').error).toBeInstanceOf(Error);
    expect(schema.validate('1').error).toBeInstanceOf(Error);
    expect(schema.validate('aa').error).toBeInstanceOf(Error);
    expect(schema.validate(1).error).toBeInstanceOf(Error);
    expect(schema.validate(123456).error).toBeInstanceOf(Error);
    expect(schema.validate(null).error).toBeInstanceOf(Error);
    expect(schema.validate({}).error).toBeInstanceOf(Error);

    expect(schema.validate(undefined).error).toBeNull();
    expect(schema.validate('123').error).toBeNull();
    expect(schema.validate('+32494555890').error).toBeNull();
    expect(schema.validate('494322456').error).toBeNull();
    expect(schema.validate('011 69 37 83').error).toBeNull(); // Should work with the BE fallback
  });

  it('formats', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    let schema = joi.string().phoneNumber({
      defaultCountry: 'BE',
      format: 'e164'
    });
    expect(schema.validate('494322456').value).toBe('+32494322456');

    schema = joi.string().phoneNumber({
      defaultCountry: 'BE',
      format: 'international'
    });
    expect(schema.validate('494322456').value).toBe('+32 494 32 24 56');

    schema = joi.string().phoneNumber({
      defaultCountry: 'BE',
      format: 'national'
    });
    expect(schema.validate('494322456').value).toBe('0494 32 24 56');

    schema = joi.string().phoneNumber({
      defaultCountry: 'BE',
      format: 'rfc3966'
    });
    expect(schema.validate('494322456').value).toBe('tel:+32-494-32-24-56');

    schema = joi.string().phoneNumber({
      defaultCountry: 'BE',
      format: 'rfc3966'
    });
    expect(schema.validate('494322456', {convert: false}).value).toBe('494322456');

    schema = joi.string().phoneNumber({
      defaultCountry: 'BE',
      format: 'rfc3966'
    });
    expect(schema.validate('494322456', {convert: false}).value).toBe('494322456');
  });

  it('strict validates', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const strict = joi.string().phoneNumber({defaultCountry: 'US', strict: true});
    const notStrict = joi.string().phoneNumber({defaultCountry: 'US'});
    const numbers = ['7777777777', '1234567890'];

    for (const number of numbers) {
      expect(strict.validate(number).error.name).toEqual('ValidationError');
      expect(notStrict.validate(number).error).toEqual(null);
    }
  });

  it('validates and formats without a country', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.string().phoneNumber({
      format: 'e164'
    });

    expect(schema.validate('32494322456').error).toBeInstanceOf(Error);
    expect(schema.validate('+32494322456').error).toBeNull();
  });

  it('should take multiple countries', () => {
    const joi = Joi.extend(JoiPhoneNumber);
    const schema = joi.string().phoneNumber({
      defaultCountry: ['US', 'BE']
    });
    expect(schema.validate('011 999 7083').value).toBe('011 999 7083');
  });

  it('errors on wrong format options', () => {
    const joi = Joi.extend(JoiPhoneNumber);

    expect(() => {
      joi.string().phoneNumber({
        format: 'ppp'
      });
    }).toThrow('"format" must be one of [e164, international, national, rfc3966]');

    expect(() => {
      joi.string().phoneNumber({});
    }).toThrow('must have at least 1 children');
  });
});

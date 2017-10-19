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
    const schema = joi.string().phoneNumber();

    const failTests = [
      '',
      '1',
      'aa',
      1,
      123456,
      null,
      {}
    ];
    const successTests = [
      undefined,
      '123',
      '+32494555890',
      '494322456'
    ];

    failTests.forEach(testCase => {
      expect(schema.validate(testCase).error).toBeInstanceOf(Error);
    });

    successTests.forEach(testCase => {
      expect(schema.validate(testCase).error).toBeNull();
    });
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

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
});

# joi-phone-number

Phone number validation rule for Joi

[![Build Status](https://travis-ci.org/Salesflare/joi-phone-number.svg?branch=master)](https://travis-ci.org/Salesflare/joi-phone-number)
[![Greenkeeper badge](https://badges.greenkeeper.io/Salesflare/joi-phone-number.svg)](https://greenkeeper.io/)

## What

Allows you to do `Joi.string().phoneNumber()`.

Uses https://github.com/ruimarinho/google-libphonenumber for validation.
Which uses the Google lib https://github.com/googlei18n/libphonenumber.

## How

```js
const myCustomJoi = Joi.extend(require('joi-phone-number'));

myCustomJoi.string().phoneNumber().validate('+32494567324');
myCustomJoi.string().phoneNumber('BE').validate('+32494567324');

// phone number can be transformed to proper format
myCustomJoi.string().phoneNumber('BE', 'e164').validate('494322456'); // '+32494322456'
myCustomJoi.string().phoneNumber('BE', 'international').validate('494322456'); // '+32 494 32 24 56'
myCustomJoi.string().phoneNumber('BE', 'national').validate('494322456'); // '0494 32 24 56'
myCustomJoi.string().phoneNumber('BE', 'rfc3966').validate('494322456'); // 'tel:+32-494-32-24-56'
```

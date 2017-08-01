# joi-phone-number

Phone number validation rule for Joi

[![Build Status](https://travis-ci.org/Salesflare/joi-phone-number.svg?branch=master)](https://travis-ci.org/Salesflare/joi-phone-number)

## What

Allows you to do `Joi.string().phoneNumber()`.

Uses https://github.com/ruimarinho/google-libphonenumber for validation.
Which uses the Google lib https://github.com/googlei18n/libphonenumber.

## How

```js
const myCustomJoi = Joi.extend(require('@salesflare/joi-phone-number'));

myCustomJoi.string().phoneNumber().validate('+32494567324');
```
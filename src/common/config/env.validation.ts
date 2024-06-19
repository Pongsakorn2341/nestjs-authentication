import * as Joi from 'joi';

export const JoiValidation = Joi.object({
  // NODE_ENV: Joi.string()
  //   .valid('development', 'staging', 'production')
  //   .default('development'),
  PORT: Joi.number().port().default(3333),
  BASE_ENDPOINT: Joi.string().required(),

  DATABASE_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
});

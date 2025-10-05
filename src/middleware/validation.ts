import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './error';

export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property]);
    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      throw new AppError(`Validation error: ${message}`, 400, 'VALIDATION_ERROR');
    }
    next();
  };
};

export const schemas = {
  accountId: Joi.object({
    accountId: Joi.number().integer().positive().required()
  }),
  
  transaction: Joi.object({
    type: Joi.string().valid('deposit', 'withdrawal', 'transfer').required(),
    amount: Joi.number().required(),
    source_account_id: Joi.number().integer().positive().when('type', {
      is: Joi.string().valid('withdrawal', 'transfer'),
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
    destination_account_id: Joi.number().integer().positive().when('type', {
      is: Joi.string().valid('deposit', 'transfer'),
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
  })
};
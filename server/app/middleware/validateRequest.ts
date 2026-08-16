import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import httpStatus from 'http-status';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Assign parsed/sanitized data back
      if (parsed) {
        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined) req.query = parsed.query;
        if (parsed.params !== undefined) req.params = parsed.params;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          path: err.path.join('.').replace(/^(body|query|params)\./, ''),
          message: err.message,
        }));

        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errorMessages: formattedErrors,
        });
      }
      next(error);
    }
  };
};

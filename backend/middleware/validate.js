const { z } = require('zod');

const createProjectSchema = z.object({
  client_id: z.string({
    required_error: 'client_id is required',
    invalid_type_error: 'client_id must be a string',
  }).min(1, 'client_id cannot be empty'),
  title: z.string({
    required_error: 'title is required',
    invalid_type_error: 'title must be a string',
  }).min(1, 'title cannot be empty'),
  contingency_percentage: z.coerce
    .number({ invalid_type_error: 'contingency_percentage must be a number' })
    .min(0, 'contingency_percentage must be >= 0')
    .optional()
    .nullable(),
  profit_margin: z.coerce
    .number({ invalid_type_error: 'profit_margin must be a number' })
    .min(0, 'profit_margin must be >= 0')
    .optional()
    .nullable(),
});

const createLineItemSchema = z.object({
  category: z.enum(['FRONTEND', 'BACKEND', 'CLOUD', 'MAINTENANCE'], {
    required_error: 'category is required',
    invalid_type_error: 'category must be one of: FRONTEND, BACKEND, CLOUD, MAINTENANCE',
  }),
  description: z.string({
    required_error: 'description is required',
    invalid_type_error: 'description must be a string',
  }).min(1, 'description cannot be empty'),
  estimated_hours: z.coerce
    .number({
      required_error: 'estimated_hours is required',
      invalid_type_error: 'estimated_hours must be a number',
    })
    .min(0, 'estimated_hours must be >= 0'),
  hourly_rate: z.coerce
    .number({
      required_error: 'hourly_rate is required',
      invalid_type_error: 'hourly_rate must be a number',
    })
    .min(0, 'hourly_rate must be >= 0'),
  is_recurring: z.boolean().optional().default(false),
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
      issues: result.error.issues,
    });
  }
  req.body = result.data;
  next();
};

module.exports = {
  createProjectSchema,
  createLineItemSchema,
  validateBody,
};


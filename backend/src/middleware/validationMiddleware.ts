import { NextFunction, Request, Response } from 'express';

const leadStatuses = ['New', 'Contacted', 'Qualified', 'Lost'] as const;
const leadSources = ['Website', 'Instagram', 'Referral'] as const;
const userRoles = ['admin', 'sales_user'] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return getString(value[0]);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const isPositiveInteger = (value: string): boolean => /^\d+$/.test(value) && Number(value) > 0;

const sendValidationError = (res: Response, errors: string[]): void => {
  res.status(400).json({
    message: 'Validation failed',
    errors,
  });
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const errors: string[] = [];
  const name = getString(req.body?.name);
  const email = getString(req.body?.email);
  const password = getString(req.body?.password);
  const role = getString(req.body?.role);

  if (!name) {
    errors.push('Name is required');
  }

  if (!email || !emailPattern.test(email)) {
    errors.push('A valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (role && !userRoles.includes(role as typeof userRoles[number])) {
    errors.push('Role must be admin or sales_user');
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const errors: string[] = [];
  const email = getString(req.body?.email);
  const password = getString(req.body?.password);

  if (!email || !emailPattern.test(email)) {
    errors.push('A valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
};

export const validateLeadCreate = (req: Request, res: Response, next: NextFunction) => {
  const errors = getLeadBodyErrors(req.body, true);

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
};

export const validateLeadUpdate = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ['name', 'email', 'status', 'source'];
  const hasAllowedField = allowedFields.some((field) => req.body?.[field] !== undefined);
  const errors = getLeadBodyErrors(req.body, false);

  if (!hasAllowedField) {
    errors.push('At least one lead field is required');
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
};

export const validateLeadListQuery = (req: Request, res: Response, next: NextFunction) => {
  const errors = getLeadQueryErrors(req.query, true);

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
};

export const validateLeadExportQuery = (req: Request, res: Response, next: NextFunction) => {
  const errors = getLeadQueryErrors(req.query, false);

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  next();
};

const getLeadBodyErrors = (body: Record<string, unknown> | undefined, requireAll: boolean): string[] => {
  const errors: string[] = [];
  const name = getString(body?.name);
  const email = getString(body?.email);
  const status = getString(body?.status);
  const source = getString(body?.source);

  if (requireAll && !name) {
    errors.push('Name is required');
  }

  if (body?.name !== undefined && !name) {
    errors.push('Name cannot be empty');
  }

  if (requireAll && !email) {
    errors.push('Email is required');
  }

  if (body?.email !== undefined && (!email || !emailPattern.test(email))) {
    errors.push('A valid email is required');
  }

  if (status && !leadStatuses.includes(status as typeof leadStatuses[number])) {
    errors.push('Status must be New, Contacted, Qualified, or Lost');
  }

  if (requireAll && !source) {
    errors.push('Source is required');
  }

  if (body?.source !== undefined && (!source || !leadSources.includes(source as typeof leadSources[number]))) {
    errors.push('Source must be Website, Instagram, or Referral');
  }

  return errors;
};

const getLeadQueryErrors = (query: Request['query'], includePagination: boolean): string[] => {
  const errors: string[] = [];
  const page = getString(query.page);
  const limit = getString(query.limit);
  const status = getString(query.status);
  const source = getString(query.source);
  const sortBy = getString(query.sortBy);
  const sortOrder = getString(query.sortOrder);

  if (includePagination && page && !isPositiveInteger(page)) {
    errors.push('Page must be a positive integer');
  }

  if (includePagination && limit) {
    if (!isPositiveInteger(limit)) {
      errors.push('Limit must be a positive integer');
    } else if (Number(limit) > 100) {
      errors.push('Limit cannot exceed 100');
    }
  }

  if (status && !leadStatuses.includes(status as typeof leadStatuses[number])) {
    errors.push('Status must be New, Contacted, Qualified, or Lost');
  }

  if (source && !leadSources.includes(source as typeof leadSources[number])) {
    errors.push('Source must be Website, Instagram, or Referral');
  }

  if (sortBy && sortBy !== 'createdAt') {
    errors.push('Only createdAt sorting is supported');
  }

  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    errors.push('Sort order must be asc or desc');
  }

  return errors;
};

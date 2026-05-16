import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/leadService';
import { ILead } from '../models/Lead';

interface LeadFilters {
  status?: string;
  source?: string;
  search?: string;
}

const getQueryString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return getQueryString(value[0]);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getLeadFilters = (query: Request['query']): LeadFilters => {
  const status = getQueryString(query.status);
  const source = getQueryString(query.source);
  const search = getQueryString(query.search);

  return {
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
    ...(search ? { search } : {}),
  };
};

const parsePositiveInteger = (
  value: unknown,
  fallback: number,
  options: { max?: number } = {}
): number => {
  const parsed = Number.parseInt(getQueryString(value) ?? '', 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return options.max ? Math.min(parsed, options.max) : parsed;
};

const parseSortOrder = (value: unknown): 'asc' | 'desc' => {
  return getQueryString(value) === 'asc' ? 'asc' : 'desc';
};

const getRouteParam = (value: unknown): string | undefined => {
  return getQueryString(value);
};

const parseLegacyFilters = (value: unknown): LeadFilters => {
  const rawFilters = getQueryString(value);
  if (!rawFilters) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawFilters) as Record<string, unknown>;
    return {
      ...(typeof parsed.status === 'string' ? { status: parsed.status } : {}),
      ...(typeof parsed.source === 'string' ? { source: parsed.source } : {}),
      ...(typeof parsed.search === 'string' ? { search: parsed.search } : {}),
    };
  } catch {
    return {};
  }
};

export const getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pageNum = parsePositiveInteger(req.query.page, 1);
    const limitNum = parsePositiveInteger(req.query.limit, 10, { max: 100 });
    const sortOrder = parseSortOrder(req.query.sortOrder);
    const filters = getLeadFilters(req.query);

    const result = await LeadService.getLeads(
      filters,
      {
        createdAt: sortOrder
      },
      {
        page: pageNum,
        limit: limitNum
      }
    );
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getRouteParam(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'Lead ID is required' });
      return;
    }

    const lead = await LeadService.getLeadById(id);
    
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leadData = req.body;
    const lead = await LeadService.createLead(leadData);
    
    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getRouteParam(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'Lead ID is required' });
      return;
    }

    const leadData = req.body;
    const lead = await LeadService.updateLead(id, leadData);
    
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getRouteParam(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'Lead ID is required' });
      return;
    }

    const result = await LeadService.deleteLead(id);
    
    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const exportLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = {
      ...parseLegacyFilters(req.query.filters),
      ...getLeadFilters(req.query),
    };
    const leads = await LeadService.exportLeads(filters);
    
    // Convert leads array to CSV string with proper escaping
    const csvString = leadsToCSV(leads);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.status(200).send(csvString);
  } catch (error) {
    next(error);
  }
};

// Helper function to escape CSV values
const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = value instanceof Date ? value.toISOString() : String(value);
  
  // Check if value needs to be quoted (contains comma, quote, or newline)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Escape quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    // Wrap in quotes
    return `"${escaped}"`;
  }
  
  return str;
};

// Helper function to convert leads array to CSV
const leadsToCSV = (leads: ILead[]): string => {
  if (leads.length === 0) {
    return '';
  }
  
  // Define CSV headers
  const headers = ['Name', 'Email', 'Status', 'Source', 'Created At', 'Updated At'];
  
  // Map leads to CSV rows
  const rows = leads.map(lead => [
    escapeCsvValue(lead.name),
    escapeCsvValue(lead.email),
    escapeCsvValue(lead.status),
    escapeCsvValue(lead.source),
    escapeCsvValue(lead.createdAt),
    escapeCsvValue(lead.updatedAt)
  ]);
  
  // Join headers and rows with commas, and rows with newlines
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

import Lead, { ILead } from '../models/Lead';

interface FilterOptions {
  status?: string;
  source?: string;
  search?: string;
}

interface SortOptions {
  createdAt: 'asc' | 'desc';
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface LeadCreateData {
  name: string;
  email: string;
  status?: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source?: 'Website' | 'Instagram' | 'Referral';
}

interface LeadUpdateData {
  name?: string;
  email?: string;
  status?: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source?: 'Website' | 'Instagram' | 'Referral';
}

export class LeadService {
  static async getLeads(
    filters: FilterOptions,
    sort: SortOptions,
    pagination: PaginationOptions,
    requesterId: string,
    requesterRole: string
  ): Promise<PaginatedResponse<ILead>> {
    const { status, source, search } = filters;
    const { page, limit } = pagination;

    const filterQuery: Record<string, unknown> = {};

    // Privacy Filter: Sales users only see their own leads
    if (requesterRole !== 'admin') {
      filterQuery.user = requesterId;
    }

    if (status) {
      filterQuery.status = status;
    }

    if (source) {
      filterQuery.source = source;
    }

    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortQuery: Record<string, 1 | -1> = {
      createdAt: sort.createdAt === 'desc' ? -1 : 1,
    };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Lead.find(filterQuery).sort(sortQuery).skip(skip).limit(limit).exec(),
      Lead.countDocuments(filterQuery),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async getLeadById(id: string, requesterId: string, requesterRole: string): Promise<ILead | null> {
    const query: Record<string, unknown> = { _id: id };
    if (requesterRole !== 'admin') {
      query.user = requesterId;
    }
    return Lead.findOne(query).exec();
  }

  static async createLead(data: LeadCreateData, userId: string): Promise<ILead> {
    return Lead.create({ ...data, user: userId });
  }

  static async updateLead(id: string, data: LeadUpdateData, requesterId: string, requesterRole: string): Promise<ILead | null> {
    const query: Record<string, unknown> = { _id: id };
    if (requesterRole !== 'admin') {
      query.user = requesterId;
    }
    return Lead.findOneAndUpdate(query, data, { new: true, runValidators: true }).exec();
  }

  static async deleteLead(id: string, requesterId: string, requesterRole: string): Promise<ILead | null> {
    const query: Record<string, unknown> = { _id: id };
    // Only admins can delete, but we keep the query check for safety
    if (requesterRole !== 'admin') {
      query.user = requesterId;
    }
    return Lead.findOneAndDelete(query).exec();
  }

  static async exportLeads(
    filters: FilterOptions,
    requesterId: string,
    requesterRole: string
  ): Promise<ILead[]> {
    const { status, source, search } = filters;

    const filterQuery: Record<string, unknown> = {};
    if (requesterRole !== 'admin') {
      filterQuery.user = requesterId;
    }

    if (status) {
      filterQuery.status = status;
    }

    if (source) {
      filterQuery.source = source;
    }

    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    return Lead.find(filterQuery).sort({ createdAt: -1 }).exec();
  }
}


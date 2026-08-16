import { prisma } from '../../../lib/prisma';

export interface CreateAuditLogPayload {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any>;
}

const logAction = async (payload: CreateAuditLogPayload) => {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: payload.actorId,
        action: payload.action,
        targetType: payload.targetType,
        targetId: payload.targetId,
        details: payload.details ? (payload.details as any) : undefined,
      },
    });
  } catch (err) {
    console.error('[AuditLog Error]', err);
    return null;
  }
};

const getAuditLogs = async (query: any = {}) => {
  const { page = 1, limit = 25, action, targetType } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (targetType) where.targetType = targetType;

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true, image: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    meta: { total, page: Number(page), limit: Number(limit) },
    data,
  };
};

export const AuditService = {
  logAction,
  getAuditLogs,
};

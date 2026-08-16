import { Request, Response } from 'express';
import httpStatus from 'http-status';
import asyncHandler from '../../utils/asyncHandler';
import sendResponse from '../../utils/sendResponse';
import { AuditService } from './audit.service';

const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuditService.getAuditLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit logs retrieved successfully',
    pagination: result.meta,
    data: result.data,
  });
});

export const AuditController = {
  getAuditLogs,
};

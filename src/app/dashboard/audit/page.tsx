import { auditService } from "@/services/audit.service";
import { AuditLogsClient } from "@/components/dashboard/audit/AuditLogsClient";

export const metadata = {
  title: "Staff Audit Logs | Dashboard",
  description: "Tamper-evident record of administrative and moderation actions on the platform.",
};

export default async function AuditLogsDashboardPage() {
  const res = await auditService.getAuditLogs({ page: 1, limit: 25 });
  const logs = res.success && Array.isArray(res.data) ? res.data : [];

  return <AuditLogsClient initialLogs={logs} />;
}

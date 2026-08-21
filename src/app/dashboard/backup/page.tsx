import { backupService } from "@/services/backup.service";
import { BackupClient } from "@/components/dashboard/backup/BackupClient";

export const metadata = {
  title: "Database Backup & Snapshot Center | Dashboard",
  description: "Export full JSON data backups across all tables for offline storage and disaster recovery.",
};

export default async function AdminBackupPage() {
  const res = await backupService.getStats();
  const stats = res.success ? res.data : null;

  return <BackupClient initialStats={stats} />;
}

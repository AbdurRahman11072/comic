import { pointsService } from "@/services/points.service";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";

export default async function TransactionsManagementPage() {
  const res = await pointsService.getAllTransactions();
  const transactions = res?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-sm text-muted-foreground">Monitor all point earnings and chapter purchases.</p>
      </div>

      <TransactionsTable initialTransactions={transactions} />
    </div>
  );
}

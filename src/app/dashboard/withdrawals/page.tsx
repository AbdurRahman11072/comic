import { withdrawalService } from "@/services/withdrawal.service";
import { userService } from "@/services/user.service";
import { WithdrawalsClient } from "@/components/dashboard/withdrawals/WithdrawalsClient";

export const metadata = {
  title: "Withdrawal Requests | Dashboard",
  description: "Review, process creator payouts, and inspect user transaction history",
};

export default async function WithdrawalsPage() {
  const [withdrawalsRes, session] = await Promise.all([
    withdrawalService.getWithdrawalRequests({ status: "PENDING", limit: 20 }),
    userService.getUserSession(),
  ]);

  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <WithdrawalsClient
      initialRequests={withdrawalsRes.data || []}
      initialMeta={withdrawalsRes.pagination || null}
      initialIsAdmin={isAdmin}
    />
  );
}

import type { Metadata } from "next";
import { TransactionsClient } from "@/components/transactions/TransactionsClient";
import { constructMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Transaction History & Cashout",
    description: "Keep track of your points earnings, purchases, rewards, and cashout requests.",
    keywords: ["transactions", "point balance", "cashout", "withdraw points", "rewards history"],
  });
}

export default function TransactionsPage() {
  return <TransactionsClient />;
}

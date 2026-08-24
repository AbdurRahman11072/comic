import { WithdrawalUser } from "@/services/withdrawal.service";

export interface FinancialHistoryData {
  user: WithdrawalUser;
  stats: {
    totalAdViews: number;
    totalAdPointsEarned: number;
    totalChaptersPurchased: number;
    totalFiatWithdrawn: number;
    totalPointsWithdrawn: number;
    previousWithdrawalsCount: number;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
  withdrawals: Array<{
    id: string;
    pointsRequested: number;
    fiatAmount: number;
    bankDetails: string;
    status: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface ParsedPayout {
  platform: string;
  accountType?: string;
  destination: string;
  holderName?: string;
}

export function parsePayoutDetails(raw: string): ParsedPayout {
  if (!raw) return { platform: "Manual", destination: "—" };

  const match = raw.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (match) {
    const fullTag = match[1].trim(); // e.g. "bKash - Personal" or "Nagad" or "Bank Transfer"
    let remainder = match[2].trim(); // e.g. "Phone: 01812345678 | Name: John"

    let platform = fullTag;
    let accountType: string | undefined = undefined;

    if (fullTag.includes(" - ")) {
      const parts = fullTag.split(" - ");
      platform = parts[0].trim();
      accountType = parts[1].trim();
    }

    let holderName: string | undefined = undefined;
    if (remainder.includes(" | Name: ")) {
      const parts = remainder.split(" | Name: ");
      remainder = parts[0].trim();
      holderName = parts[1].trim();
    } else if (remainder.includes(" | ")) {
      const parts = remainder.split(" | ");
      remainder = parts[0].trim();
      holderName = parts[1].trim();
    }

    return {
      platform,
      accountType,
      destination: remainder,
      holderName,
    };
  }

  // Fallback for legacy format strings
  const lower = raw.toLowerCase();
  let detected = "Bank Transfer";
  if (lower.includes("bkash")) detected = "bKash";
  else if (lower.includes("nagad")) detected = "Nagad";
  else if (lower.includes("rocket")) detected = "Rocket";
  else if (lower.includes("paypal")) detected = "PayPal";
  else if (lower.includes("usdt") || lower.includes("crypto") || lower.includes("trc20"))
    detected = "USDT";

  return {
    platform: detected,
    destination: raw,
  };
}

export function getPlatformBadgeStyle(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("bkash")) {
    return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  }
  if (p.includes("nagad")) {
    return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  }
  if (p.includes("rocket")) {
    return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  }
  if (p.includes("upay")) {
    return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  }
  if (p.includes("paypal")) {
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }
  if (p.includes("usdt") || p.includes("crypto") || p.includes("binance")) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (p.includes("bank")) {
    return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  }
  return "bg-primary/15 text-primary border-primary/30";
}

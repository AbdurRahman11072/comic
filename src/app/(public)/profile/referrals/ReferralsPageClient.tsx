"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { referralService, ReferralStatsData } from "@/services/referral.service";
import { ProfileSidebar } from "@/components/dashboard/profile/ProfileSidebar";
import { ReferralsTab } from "@/components/dashboard/profile/ReferralsTab";

export function ReferralsPageClient({ profile }: { profile: any }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStatsData | null>(null);
  const [referralLoading, setReferralLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    referralService.getReferralStats().then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setReferralStats(res.data);
        }
        setReferralLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const referralCode = referralStats?.referralCode || profile?.referralCode || "CBD-PENDING";
  const shareableUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${referralCode}`
      : `https://comicbd.com/?ref=${referralCode}`;

  const copyToClipboard = (text: string, isLink: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Referral link copied to clipboard!");
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success("Referral code copied!");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <ProfileSidebar
        profile={profile}
        name={profile?.name || ""}
        image={profile?.image || ""}
      />

      <div className="flex-1 min-w-0">
        <ReferralsTab
          referralStats={referralStats}
          referralLoading={referralLoading}
          referralCode={referralCode}
          shareableUrl={shareableUrl}
          copiedCode={copiedCode}
          copiedLink={copiedLink}
          onCopy={copyToClipboard}
        />
      </div>
    </div>
  );
}

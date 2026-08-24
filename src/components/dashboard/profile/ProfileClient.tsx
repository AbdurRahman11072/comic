"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { UpdateUserProfileAction } from "@/actions/user";
import { referralService, ReferralStatsData } from "@/services/referral.service";

import { ProfileSidebar, ProfileTabType } from "./ProfileSidebar";
import { PersonalInfoTab } from "./PersonalInfoTab";
import { ReferralsTab } from "./ReferralsTab";
import { TransactionHistoryTab } from "./TransactionHistoryTab";
import { SecurityTab } from "./SecurityTab";

interface ProfileClientProps {
  initialProfile: any;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [tab, setTab] = useState<ProfileTabType>("info");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Referral Stats
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

  // Profile Edit State
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [image, setImage] = useState(profile?.image || "");

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await UpdateUserProfileAction({ name, image });
      if (res.success) {
        setProfile({ ...profile, name, image });
        toast.success("Profile updated successfully!");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (_err) {
      toast.error("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (_err) {
      toast.error("An error occurred while changing password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar / Tabs */}
      <ProfileSidebar
        profile={profile}
        name={name}
        image={image}
        tab={tab}
        onTabChange={setTab}
        onImageUploaded={(url) => setImage(url)}
      />

      {/* Content */}
      <div className="flex-1 space-y-6">
        {tab === "info" && (
          <PersonalInfoTab
            name={name}
            email={profile?.email}
            image={image}
            saving={saving}
            onNameChange={setName}
            onImageChange={setImage}
            onSubmit={handleUpdateProfile}
          />
        )}

        {tab === "referrals" && (
          <ReferralsTab
            referralStats={referralStats}
            referralLoading={referralLoading}
            referralCode={referralCode}
            shareableUrl={shareableUrl}
            copiedCode={copiedCode}
            copiedLink={copiedLink}
            onCopy={copyToClipboard}
          />
        )}

        {tab === "history" && (
          <TransactionHistoryTab pointTransactions={profile?.pointTransactions} />
        )}

        {tab === "security" && (
          <SecurityTab
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            passwordLoading={passwordLoading}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handleChangePassword}
          />
        )}
      </div>
    </div>
  );
}

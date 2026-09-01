"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { ProfileSidebar } from "@/components/dashboard/profile/ProfileSidebar";
import { SecurityTab } from "@/components/dashboard/profile/SecurityTab";

export function SecurityPageClient({ profile }: { profile: any }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
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
      <ProfileSidebar
        profile={profile}
        name={profile?.name || ""}
        image={profile?.image || ""}
      />

      <div className="flex-1 min-w-0">
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
      </div>
    </div>
  );
}

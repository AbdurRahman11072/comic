"use client";

import React from "react";
import { Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SecurityTabProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordLoading: boolean;
  onCurrentPasswordChange: (val: string) => void;
  onNewPasswordChange: (val: string) => void;
  onConfirmPasswordChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SecurityTab({
  currentPassword,
  newPassword,
  confirmPassword,
  passwordLoading,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: SecurityTabProps) {
  return (
    <div className="glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
      <h3 className="text-2xl font-bold mb-6">Security Settings</h3>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              className="bg-background/50 border-white/10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              className="bg-background/50 border-white/10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              className="bg-background/50 border-white/10"
              required
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-white/5">
          <Button
            type="submit"
            disabled={passwordLoading}
            className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-bold cursor-pointer"
          >
            {passwordLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import React from "react";
import {
  AlertTriangle,
  Banknote,
  CreditCard,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

interface SystemSettingsSectionProps {
  form: any;
  updateField: (key: string, value: any) => void;
}

export function SystemSettingsSection({ form, updateField }: SystemSettingsSectionProps) {
  return (
    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" /> Operational Feature Switches
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Maintenance Mode */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-white">Maintenance Mode</span>
            </div>
            <input
              type="checkbox"
              checked={form.isMaintenanceMode}
              onChange={(e) => updateField("isMaintenanceMode", e.target.checked)}
              className="w-5 h-5 rounded text-primary border-white/10 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Displays an alert banner across the site alerting users of ongoing server updates.
          </p>
          {form.isMaintenanceMode && (
            <input
              type="text"
              value={form.maintenanceMessage}
              onChange={(e) => updateField("maintenanceMessage", e.target.value)}
              placeholder="Custom maintenance message..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white outline-none"
            />
          )}
        </div>

        {/* Allow New Registrations */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm text-white">New User Registrations</span>
            </div>
            <input
              type="checkbox"
              checked={form.allowNewRegistrations}
              onChange={(e) => updateField("allowNewRegistrations", e.target.checked)}
              className="w-5 h-5 rounded text-primary border-white/10 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, new visitors can sign up. Disable during bot floods or private testing.
          </p>
        </div>

        {/* Creator Applications */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white">Creator Applications</span>
            </div>
            <input
              type="checkbox"
              checked={form.allowCreatorApplications}
              onChange={(e) => updateField("allowCreatorApplications", e.target.checked)}
              className="w-5 h-5 rounded text-primary border-white/10 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Controls whether readers can submit series applications and upgrade to Creator role.
          </p>
        </div>

        {/* Global Community Chat */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-sm text-white">Global Community Chat</span>
            </div>
            <input
              type="checkbox"
              checked={form.enableGlobalChat}
              onChange={(e) => updateField("enableGlobalChat", e.target.checked)}
              className="w-5 h-5 rounded text-primary border-white/10 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Toggles the floating live community drawer on the reader homepage.
          </p>
        </div>

        {/* Stripe Credit Purchases */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-sm text-white">Stripe Point Top-ups</span>
            </div>
            <input
              type="checkbox"
              checked={form.enableStripePayment}
              onChange={(e) => updateField("enableStripePayment", e.target.checked)}
              className="w-5 h-5 rounded text-primary border-white/10 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Accept online credit card payments via Stripe Checkout in the Point Shop.
          </p>
        </div>

        {/* Creator Cashouts */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm text-white">Creator Cashouts & Withdrawals</span>
            </div>
            <input
              type="checkbox"
              checked={form.enableCashOut}
              onChange={(e) => updateField("enableCashOut", e.target.checked)}
              className="w-5 h-5 rounded text-primary border-white/10 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Allows eligible creators to request manual withdrawals and points payout conversions.
          </p>
        </div>

        {/* Premium Chapter Locks */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-white">Premium Paid Chapters</span>
            </div>
            <input
              type="checkbox"
              checked={form.enablePremiumChapters}
              onChange={(e) => updateField("enablePremiumChapters", e.target.checked)}
              className="w-5 h-5 rounded text-primary border-white/10 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            When disabled, all locked chapters unlock free across the entire reader.
          </p>
        </div>
      </div>
    </div>
  );
}

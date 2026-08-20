"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { siteService, SiteConfigData } from "@/services/site.service";
import { SITE_DEFAULTS } from "@/config/site";

interface SiteConfigContextType {
  config: SiteConfigData;
  isLoading: boolean;
  updateConfig: (newConfig: Partial<SiteConfigData>) => void;
  refreshConfig: () => Promise<void>;
}

const DEFAULT_CONFIG: SiteConfigData = {
  appName: SITE_DEFAULTS.appName,
  appTagline: SITE_DEFAULTS.appTagline,
  appLogoUrl: SITE_DEFAULTS.appLogoUrl,
  heroHeadline: SITE_DEFAULTS.heroHeadline,
  heroSubtitle: SITE_DEFAULTS.heroSubtitle,
  discord: SITE_DEFAULTS.discord,
  twitter: SITE_DEFAULTS.twitter,
  isMaintenanceMode: false,
  allowNewRegistrations: true,
  allowCreatorApplications: true,
  enableGlobalChat: true,
  enableStripePayment: true,
  enableCashOut: true,
  enablePremiumChapters: true,
  pointToFiatRate: 0.01,
  minWithdrawalPoints: 1000,
  creatorRevenueSharePercent: 70,
  maxDailyAdPoints: 1000,
};

const SiteConfigContext = createContext<SiteConfigContextType>({
  config: DEFAULT_CONFIG,
  isLoading: true,
  updateConfig: () => {},
  refreshConfig: async () => {},
});

export function SiteConfigProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig?: SiteConfigData | null;
}) {
  const [config, setConfig] = useState<SiteConfigData>(() => ({
    ...DEFAULT_CONFIG,
    ...(initialConfig || {}),
  }));
  const [isLoading, setIsLoading] = useState(!initialConfig);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await siteService.getSiteConfig();
      if (res.success && res.data) {
        setConfig((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch (_err) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialConfig) {
      fetchConfig();
    }
  }, [initialConfig, fetchConfig]);

  const updateConfig = useCallback((newConfig: Partial<SiteConfigData>) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
  }, []);

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        isLoading,
        updateConfig,
        refreshConfig: fetchConfig,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

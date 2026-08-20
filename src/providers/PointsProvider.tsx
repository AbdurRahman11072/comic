"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { pointsService } from "@/services/points.service";

interface PointsContextType {
  points: number;
  transactionsFrozen: boolean;
  dailyAdViews: number;
  dailyAdPointsEarned: number;
  isLoading: boolean;
  refreshPoints: () => Promise<void>;
  updateBalance: (newBalance: number, newDailyViews?: number, newDailyPoints?: number) => void;
}

const PointsContext = createContext<PointsContextType>({
  points: 0,
  transactionsFrozen: false,
  dailyAdViews: 0,
  dailyAdPointsEarned: 0,
  isLoading: true,
  refreshPoints: async () => {},
  updateBalance: () => {},
});

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: sessionPending } = useSession();
  const userId = session?.user?.id;

  const [points, setPoints] = useState(0);
  const [transactionsFrozen, setTransactionsFrozen] = useState(false);
  const [dailyAdViews, setDailyAdViews] = useState(0);
  const [dailyAdPointsEarned, setDailyAdPointsEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!userId) {
      setPoints(0);
      setTransactionsFrozen(false);
      setDailyAdViews(0);
      setDailyAdPointsEarned(0);
      setIsLoading(false);
      return;
    }

    try {
      const res = await pointsService.getPointsBalance();
      if (res.success && res.data) {
        setPoints(res.data.points ?? 0);
        setTransactionsFrozen(res.data.transactionsFrozen ?? false);
        setDailyAdViews(res.data.dailyAdViews ?? 0);
        setDailyAdPointsEarned(res.data.dailyAdPointsEarned ?? 0);
      }
    } catch (_err) {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (sessionPending) return;

    if (!userId) {
      setPoints(0);
      setTransactionsFrozen(false);
      setDailyAdViews(0);
      setDailyAdPointsEarned(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchBalance();
  }, [userId, sessionPending, fetchBalance]);

  const updateBalance = useCallback(
    (newBalance: number, newDailyViews?: number, newDailyPoints?: number) => {
      setPoints(newBalance);
      if (newDailyViews !== undefined) setDailyAdViews(newDailyViews);
      if (newDailyPoints !== undefined) setDailyAdPointsEarned(newDailyPoints);
    },
    []
  );

  return (
    <PointsContext.Provider
      value={{
        points,
        transactionsFrozen,
        dailyAdViews,
        dailyAdPointsEarned,
        isLoading,
        refreshPoints: fetchBalance,
        updateBalance,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  return useContext(PointsContext);
}

/**
 * Global Event Bus for clean cross-component state synchronization
 */

export const POINTS_UPDATED_EVENT = 'points:updated';

export const dispatchPointsUpdate = (newBalance?: number) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(POINTS_UPDATED_EVENT, {
        detail: { balance: newBalance },
      })
    );
  }
};

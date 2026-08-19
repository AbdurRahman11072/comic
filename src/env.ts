const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;
};

export const env = {
  get NEXT_PUBLIC_APP_URL() {
    return getBaseUrl();
  },
  get NEXT_PUBLIC_API_URL() {
    return getBaseUrl();
  },
  get NEXT_PUBLIC_BETTER_AUTH_URL() {
    return getBaseUrl();
  },
};

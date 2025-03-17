interface EventData {
  [key: string]: string | number | boolean;
}

export function useAnalytics() {
  const trackEvent = (eventName: string, data: EventData) => {
    console.log(`[Analytics] ${eventName}:`, data);
    // In a real app, this would send data to an analytics service
  };

  return { trackEvent };
} 
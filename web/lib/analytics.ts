// Google Analytics Event Tracking Utilities

declare global {
    interface Window {
        gtag?: (
            command: 'event' | 'config',
            targetId: string,
            config?: Record<string, any>
        ) => void;
    }
}

export const GA_EVENTS = {
    // User Actions
    SIGNUP: 'signup',
    LOGIN: 'login',

    // Predictions
    PREDICTION_GENERATED: 'prediction_generated',
    PREDICTION_SHARED: 'prediction_shared',

    // Premium
    PREMIUM_UPGRADE: 'premium_upgrade',
    TRIAL_STARTED: 'trial_started',

    // Engagement
    PAGE_VIEW: 'page_view',
    SHARE_CLICK: 'share_click',
} as const;

/**
 * Track a custom event in Google Analytics
 */
export const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, eventParams);
    }
};

/**
 * Track user signup
 */
export const trackSignup = (method: 'email' | 'google' = 'email') => {
    trackEvent(GA_EVENTS.SIGNUP, {
        method,
        trial_included: true,
    });
};

/**
 * Track user login
 */
export const trackLogin = (method: 'email' | 'google' = 'email') => {
    trackEvent(GA_EVENTS.LOGIN, {
        method,
    });
};

/**
 * Track AI prediction generation
 */
export const trackPrediction = (params: {
    sport: string;
    propType: string;
    probability: number;
    playerName: string;
}) => {
    trackEvent(GA_EVENTS.PREDICTION_GENERATED, {
        sport: params.sport,
        prop_type: params.propType,
        probability: params.probability,
        player_name: params.playerName,
        is_hot_pick: params.probability >= 75,
    });
};

/**
 * Track prediction share
 */
export const trackShare = (params: {
    sport: string;
    playerName: string;
    probability: number;
}) => {
    trackEvent(GA_EVENTS.PREDICTION_SHARED, {
        sport: params.sport,
        player_name: params.playerName,
        probability: params.probability,
    });
};

/**
 * Track premium upgrade
 */
export const trackPremiumUpgrade = (plan: string) => {
    trackEvent(GA_EVENTS.PREMIUM_UPGRADE, {
        plan,
        value: plan === 'monthly' ? 9.99 : 99.99,
        currency: 'USD',
    });
};

/**
 * Track trial start
 */
export const trackTrialStart = () => {
    trackEvent(GA_EVENTS.TRIAL_STARTED, {
        trial_days: 15,
    });
};

/**
 * Track custom page view
 */
export const trackPageView = (url: string, title?: string) => {
    trackEvent(GA_EVENTS.PAGE_VIEW, {
        page_path: url,
        page_title: title || document.title,
    });
};

/**
 * SEO utility functions for dynamic meta tags and page titles
 */

export interface SEOData {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    canonical?: string;
    noindex?: boolean;
}

/**
 * Generate page title with app branding
 */
export function generatePageTitle(pageTitle?: string): string {
    const appName = "Sentinel";
    const tagline = "AI Web3 Safety Platform";

    if (!pageTitle) {
        return `${appName} - ${tagline} | Blockchain-Powered Digital Safety`;
    }

    return `${pageTitle} | ${appName} - ${tagline}`;
}

/**
 * Generate page description with app context
 */
export function generatePageDescription(description?: string): string {
    const baseDescription =
        "Sentinel combines AI moderation, analytics, and blockchain transparency to create safer digital environments for families and organizations.";

    if (!description) {
        return baseDescription;
    }

    return `${description} ${baseDescription}`;
}

/**
 * Generate keywords for a specific page
 */
export function generatePageKeywords(pageKeywords?: string[]): string {
    const baseKeywords = [
        "AI safety",
        "Web3 security",
        "blockchain moderation",
        "digital safety",
        "family protection",
        "content moderation",
        "Algorand",
        "AI-powered safety",
        "online safety",
        "blockchain transparency",
        "digital trust",
        "Web3 safety platform",
    ];

    const allKeywords = pageKeywords
        ? [...pageKeywords, ...baseKeywords]
        : baseKeywords;
    return [...new Set(allKeywords)].join(", ");
}

/**
 * Generate Open Graph data
 */
export function generateOpenGraphData(seoData: SEOData) {
    const baseUrl = "https://sentinel.app";

    return {
        "og:title": generatePageTitle(seoData.title),
        "og:description": generatePageDescription(seoData.description),
        "og:url": seoData.url || baseUrl,
        "og:image": seoData.image || `${baseUrl}/og-image.png`,
        "og:type": "website",
        "og:site_name": "Sentinel",
        "og:locale": "en_US",
    };
}

/**
 * Generate Twitter Card data
 */
export function generateTwitterCardData(seoData: SEOData) {
    const baseUrl = "https://sentinel.app";

    return {
        "twitter:card": "summary_large_image",
        "twitter:title": generatePageTitle(seoData.title),
        "twitter:description": generatePageDescription(seoData.description),
        "twitter:image": seoData.image || `${baseUrl}/og-image.png`,
        "twitter:url": seoData.url || baseUrl,
        "twitter:creator": "@SentinelApp",
        "twitter:site": "@SentinelApp",
    };
}

/**
 * Page-specific SEO configurations
 */
export const pageSEOConfig = {
    home: {
        title: "Sentinel - AI Web3 Safety Platform",
        description:
            "Blockchain-powered digital safety platform combining AI moderation with immutable verification for families and organizations.",
        keywords: ["home", "dashboard", "overview"],
    },
    chat: {
        title: "Chat Interface",
        description:
            "Secure chat interface with real-time AI moderation and blockchain verification.",
        keywords: [
            "chat",
            "messaging",
            "communication",
            "real-time moderation",
        ],
    },
    analytics: {
        title: "Safety Analytics",
        description:
            "Comprehensive safety analytics and insights for monitoring digital interactions.",
        keywords: ["analytics", "insights", "safety metrics", "reporting"],
    },
    wallet: {
        title: "Wallet Management",
        description:
            "Manage your Algorand wallet and blockchain identity for transparent safety reporting.",
        keywords: ["wallet", "Algorand", "blockchain", "crypto", "identity"],
    },
    transactions: {
        title: "Transaction History",
        description:
            "View and verify blockchain transactions and safety incident records.",
        keywords: ["transactions", "blockchain", "history", "verification"],
    },
    contracts: {
        title: "Smart Contracts",
        description:
            "Manage and monitor smart contracts for automated safety protocols.",
        keywords: ["smart contracts", "automation", "protocols", "blockchain"],
    },
    logs: {
        title: "Activity Logs",
        description:
            "Detailed activity logs and incident tracking with blockchain verification.",
        keywords: ["logs", "activity", "incidents", "tracking"],
    },
    settings: {
        title: "Settings",
        description:
            "Configure your Sentinel safety preferences and account settings.",
        keywords: ["settings", "preferences", "configuration", "account"],
    },
    "family/members": {
        title: "Family Members",
        description:
            "Manage family members and their safety monitoring preferences.",
        keywords: ["family", "members", "management", "monitoring"],
    },
    "family/activity": {
        title: "Family Activity",
        description:
            "Monitor family activity and safety metrics across all members.",
        keywords: ["family", "activity", "monitoring", "safety metrics"],
    },
    "family/roles": {
        title: "Family Roles",
        description:
            "Configure family roles and permissions for safety management.",
        keywords: ["family", "roles", "permissions", "management"],
    },
    "auth/login": {
        title: "Login",
        description: "Secure login to your Sentinel safety platform account.",
        keywords: ["login", "authentication", "security", "access"],
    },
} as const;

/**
 * Get SEO data for a specific page
 */
export function getPageSEOData(pagePath: string): SEOData {
    const pathSegments = pagePath.split("/").filter(Boolean);
    const pageKey = pathSegments.join("/") || "home";

    const config = pageSEOConfig[pageKey as keyof typeof pageSEOConfig];

    if (!config) {
        return {
            title: generatePageTitle(),
            description: generatePageDescription(),
            keywords: generatePageKeywords(),
        };
    }

    return {
        title: config.title,
        description: config.description,
        keywords: generatePageKeywords(config.keywords),
        url: `https://sentinel.app/${pageKey === "home" ? "" : pageKey}`,
    };
}

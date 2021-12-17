enum NODE_ENV {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  LOCALHOST = "localhost",
}

enum STORAGE_NODE_VERSION {
  BETA = "beta",
  PRODUCTION = "production",
}

export const IS_DEV = process.env.NODE_ENV == NODE_ENV.DEVELOPMENT
export const IS_LOCAL = process.env.NODE_ENV == NODE_ENV.LOCALHOST
export const VERSION = process.env.VERSION ? process.env.VERSION : "local"

const PROTOCOL =
  IS_LOCAL
    ? "http"
    : IS_DEV &&
      process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
      ? "https"
      : "https";

export const STRIPE_API_KEY =
  process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.PRODUCTION
    ? "pk_live_SLMPS7zVFurFwLOKEdiICAGC00kN41fASj"
    : "pk_test_jHC9KKrYExP2pdqmuSmkPSqT00ErWapX4f";

export const HOST =
  IS_DEV || IS_LOCAL
    ? "127.0.0.1:4444"
    : process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
      ? "dev2.opacity.io"
      : "opacity.io";
export const FRONT_END_URL = `${PROTOCOL}://${HOST}`;

export const PUBLIC_SHARE_URL =
  IS_LOCAL
    ? "http://localhost:3080"
    : process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
      ? "https://public-share.opacitynodes.com"
      : "https://public.opacity.io";

export const EXCHANGE_LINK = "https://www.kucoin.com/trade/OPCT-BTC";

export const DEFAULT_STORAGE_NODE_V1 = "broker-1.opacitynodes.com";
export const DEFAULT_STORAGE_NODE_V2 = "beta-broker.opacitynodes.com";

export const DEFAULT_STORAGE_NODE_IP =
  IS_LOCAL
    ? "localhost"
    : IS_DEV
      ? DEFAULT_STORAGE_NODE_V2
      : process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
        ? DEFAULT_STORAGE_NODE_V2
        : DEFAULT_STORAGE_NODE_V1;

export const STORAGE_NODE = `${PROTOCOL}://${DEFAULT_STORAGE_NODE_IP}:3000`;

export const FILE_MAX_SIZE = 2 * 1024 * 1024 * 1024;

export const AGREEMENT_TYPES = Object.freeze({
  TERMS_OF_SERVICE: "TERMS_OF_SERVICE",
  PRIVACY_POLICY: "PRIVACY_POLICY",
  CODE_REVIEW_LICENSE: "CODE_REVIEW_LICENSE",
});

export const THIRD_PARTY = Object.freeze({
  COINMARKETCAP: "https://opacity.io/widget.php",
});

export const LANDING_PAGE_VIDEO =
  "https://s3.us-east-2.amazonaws.com/opacity-public/whatIsOpacity.mov";



export const OPACITY_DRIVE_FOR_MAC =
  IS_LOCAL || IS_DEV || process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
    ? "https://opacity-public.s3.us-east-2.amazonaws.com/dev/Opacity-Desktop.dmg"
    : "https://opacity-public.s3.us-east-2.amazonaws.com/Opacity-Desktop.dmg";

export const OPACITY_DRIVE_FOR_WINDOWS =
  IS_LOCAL || IS_DEV || process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
    ? "https://opacity-public.s3.us-east-2.amazonaws.com/dev/Opacity-Desktop.exe"
    : "https://opacity-public.s3.us-east-2.amazonaws.com/Opacity-Desktop.exe"

export const OPACITY_GO_FOR_ANDROID =
  IS_LOCAL || IS_DEV || process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
    ? "https://play.google.com/apps/testing/com.opacity"
    : "https://play.google.com/apps/testing/com.opacity";

export const OPACITY_GO_FOR_IPHONE =
  IS_LOCAL || IS_DEV || process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
    ? "https://testflight.apple.com/join/6BCYLiFO"
    : "https://testflight.apple.com/join/6BCYLiFO"


export enum HEADER_TYPES {
  LANDING_PAGE = "LANDING_PAGE",
  FILE_MANAGER = "FILE_MANAGER",
  TEAM_PAGE = "TEAM_PAGE",
  EMPTY = "EMPTY",
}

export const DESKTOP_WIDTH = "997";
export const MOBILE_WIDTH = "567";
export const SUBSCRIPTION_DESKTOP_WIDTH = "1200";
export const LANDING_PAGE_MOBILE_WIDTH = "800";
export const HEADER_MOBILE_WIDTH = "745";
export const STANDS_OUT_TABLET_WIDTH = "872";
export const STANDS_OUT_DESKTOP_WIDTH = "1000";

export enum AUTHENTICATION_STATUSES {
  LOGGED_OUT = 0,
  LOGIN_PENDING,
  LOGIN_FAILURE,
  LOGGED_IN,
}

export enum SIGNUP_PHASES {
  SELECT_PLAN = 0,
  RECORD_RECOVERY_PHRASE,
  RECORD_STORAGE_PIN,
  SEND_PAYMENT,
  CONFIRM_PAYMENT,
}

export enum UPGRADE_PHASES {
  SELECT_PLAN = 0,
  SEND_UPGRADE_PAYMENT,
  CONFIRM_PAYMENT,
}

export enum FIAT_PAYMENT_STATUSES {
  IDLE = 0,
  PENDING,
  SUCCESS,
  ERROR,
}

export const theme = {
  background: "#ffffff",
  header: {
    background: "#2e6dde",
    color: "#ffffff",
  },
  title: {
    size: "22",
    color: "#2e6dde",
    underline: {
      color: "#80b9ff",
      height: "1",
    },
  },
  container: {
    background: "#d5e2f8",
    content: "#4f5e78",
    title: {
      size: "22",
      underline: {
        width: "33",
        color: "#80b9ff",
        height: "3",
      },
    },
  },
  slider: {
    defaultColor: "rgba(46, 109, 222, 0.2)",
    hoverColor: "#2e6dde",
  },
  link: {
    color: "#2e6dde",
  },
  label: {
    color: "#2e6dde",
  },
  error: {
    color: "#ff6767",
  },
  input: {
    content: "#b0bed1",
    background: "rgba(46, 109, 222, 0.2)",
    border: {
      color: "#2e6dde",
    },
  },
  password: {
    background: "#4f5e78",
  },
  button: {
    background: "#2e6dde",
    color: "#ffffff",
    disabled: {
      background: "#dfdfdf",
      color: "#4f5e78",
      border: "1px solid #4f5e78",
    },
  },
  fontWeight: 500,
  fontStyle: "normal",
  fontStretch: "normal",
  lineHeight: "normal",
  letterSpacing: "normal",
};

export enum SHADOW {
  LEFT,
  RIGHT,
  CENTER,
}

export type PlanType = {
  isCustom: boolean;
  borderColor: string;
  content: string;
  discountedUsdCost: number | null | undefined;
  durationInMonths: number;
  opctCost: number;
  includesDesktopApp: boolean;
  isAvailable: boolean;
  isHighlighted: boolean;
  permalink: string;
  shadow: SHADOW;
  specialPricing: string | null | undefined;
  storageInGB: number;
  storageLimit: string;
  title: string;
  usdCost: number;
  zIndex: number;
  features: string[];
};

export const PLANS: PlanType[] = [
  {
    isCustom: false,
    borderColor: "#ECCD32",
    content: "Secure file sharing using blockchain technology",
    discountedUsdCost: null,
    durationInMonths: 12,
    opctCost: 0,
    includesDesktopApp: false,
    isAvailable: true,
    isHighlighted: false,
    permalink: "free",
    shadow: SHADOW.LEFT,
    specialPricing: "Free",
    storageInGB: 10,
    storageLimit: "10 GB",
    title: "Starter",
    usdCost: 0,
    zIndex: 0,
    features: [
      "End-to-End Encryption",
      "Unlimited Downloads",
      "Private File Sharing",
      "No 3rd Party Tracking",
      "Access Anywhere",
      "2GB File Size",
    ],
  },
  {
    isCustom: false,
    borderColor: "#9AD9FE",
    content: "Perfect for personal and family use",
    discountedUsdCost: null,
    durationInMonths: 12,
    opctCost: 2,
    includesDesktopApp: false,
    isAvailable: true,
    isHighlighted: false,
    permalink: "basic",
    shadow: SHADOW.LEFT,
    specialPricing: null,
    storageInGB: 128,
    storageLimit: "128 GB",
    title: "Plus",
    usdCost: 39.99,
    zIndex: 1,
    features: [
      "End-to-End Encryption",
      "Unlimited Downloads",
      "Private File Sharing",
      "No 3rd Party Tracking",
      "Access Anywhere",
      "2GB File Size",
    ],
  },
  {
    isCustom: false,
    borderColor: "#918DEA",
    content: "Secure and access your files anywhere",
    discountedUsdCost: null,
    durationInMonths: 12,
    opctCost: 16,
    includesDesktopApp: true,
    isAvailable: true,
    isHighlighted: true,
    permalink: "professional",
    shadow: SHADOW.CENTER,
    specialPricing: null,
    storageInGB: 1024,
    storageLimit: "1 TB",
    title: "Professional",
    usdCost: 99.99,
    zIndex: 2,
    features: [
      "End-to-End Encryption",
      "Unlimited Downloads",
      "Private File Sharing",
      "No 3rd Party Tracking",
      "Access Anywhere",
      "Unlimited File Size*",
      "Desktop Sync",
    ],
  },
  {
    isCustom: false,
    borderColor: "#DE9E93",
    content: "Secure file management for your organization",
    discountedUsdCost: null,
    durationInMonths: 12,
    opctCost: 16,
    includesDesktopApp: true,
    isAvailable: true,
    isHighlighted: false,
    permalink: "business",
    shadow: SHADOW.RIGHT,
    specialPricing: null,
    storageInGB: 2048,
    storageLimit: "2 TB",
    title: "Business",
    usdCost: 119.99,
    zIndex: 1,
    features: [
      "End-to-End Encryption",
      "Unlimited Downloads",
      "Private File Sharing",
      "No 3rd Party Tracking",
      "Access Anywhere",
      "Unlimited File Size*",
      "Desktop Sync",
    ],
  },
];

export enum DROP_TYPES {
  FILE,
  FOLDER,
}

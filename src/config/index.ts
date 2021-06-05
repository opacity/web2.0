export const version = "v1.3.0";

enum NODE_ENV {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

enum STORAGE_NODE_VERSION {
  BETA = "beta",
  PRODUCTION = "production",
}

const PROTOCOL = process.env.NODE_ENV == NODE_ENV.DEVELOPMENT && process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
  ? "http"
  : "https";

export const STRIPE_API_KEY = process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.PRODUCTION
  ? "pk_live_SLMPS7zVFurFwLOKEdiICAGC00kN41fASj"
  : "pk_test_jHC9KKrYExP2pdqmuSmkPSqT00ErWapX4f";

export const HOST =
  process.env.NODE_ENV == NODE_ENV.DEVELOPMENT
    ? "127.0.0.1:4444"
    : process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
    ? "dev2.opacity.io"
    : "opacity.io";
export const FRONT_END_URL = `${PROTOCOL}://${HOST}`;
export const PUBLIC_SHARE_URL = `https://public.opacity.io`;

export const EXCHANGE_LINK = "https://www.kucoin.com/trade/OPCT-BTC";

const DEFAULT_STORAGE_NODE_IP =
  process.env.NODE_ENV == NODE_ENV.DEVELOPMENT
    ? "18.191.166.234"
    : process.env.STORAGE_NODE_VERSION == STORAGE_NODE_VERSION.BETA
    ? "beta-broker.opacitynodes.com"
    : "broker-1.opacitynodes.com";

export const STORAGE_NODE = `${PROTOCOL}://${DEFAULT_STORAGE_NODE_IP}:3000`

export const FILE_MAX_SIZE = 2 * 1024 *1024 *1024;

export const AGREEMENT_TYPES = Object.freeze({
  TERMS_OF_SERVICE: "TERMS_OF_SERVICE",
  PRIVACY_POLICY: "PRIVACY_POLICY",
  CODE_REVIEW_LICENSE: "CODE_REVIEW_LICENSE"
});

export const THIRD_PARTY = Object.freeze({
  COINMARKETCAP: "https://opacity.io/widget.php"
});

export const LANDING_PAGE_VIDEO =
  "https://s3.us-east-2.amazonaws.com/opacity-public/whatIsOpacity.mov";

export enum HEADER_TYPES {
  LANDING_PAGE = "LANDING_PAGE",
  FILE_MANAGER = "FILE_MANAGER",
  TEAM_PAGE = "TEAM_PAGE",
  EMPTY = "EMPTY"
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
  LOGGED_IN
}

export enum SIGNUP_PHASES {
  SELECT_PLAN = 0,
  RECORD_RECOVERY_PHRASE,
  RECORD_STORAGE_PIN,
  SEND_PAYMENT,
  CONFIRM_PAYMENT
}

export enum UPGRADE_PHASES {
  SELECT_PLAN = 0,
  SEND_UPGRADE_PAYMENT,
  CONFIRM_PAYMENT
}

export enum FIAT_PAYMENT_STATUSES {
  IDLE = 0,
  PENDING,
  SUCCESS,
  ERROR
}

export const theme = {
  background: "#ffffff",
  header: {
    background: "#2e6dde",
    color: "#ffffff"
  },
  title: {
    size: "22",
    color: "#2e6dde",
    underline: {
      color: "#80b9ff",
      height: "1"
    }
  },
  container: {
    background: "#d5e2f8",
    content: "#4f5e78",
    title: {
      size: "22",
      underline: {
        width: "33",
        color: "#80b9ff",
        height: "3"
      }
    }
  },
  slider: {
    defaultColor: "rgba(46, 109, 222, 0.2)",
    hoverColor: "#2e6dde"
  },
  link: {
    color: "#2e6dde"
  },
  label: {
    color: "#2e6dde"
  },
  error: {
    color: "#ff6767"
  },
  input: {
    content: "#b0bed1",
    background: "rgba(46, 109, 222, 0.2)",
    border: {
      color: "#2e6dde"
    }
  },
  password: {
    background: "#4f5e78"
  },
  button: {
    background: "#2e6dde",
    color: "#ffffff",
    disabled: {
      background: "#dfdfdf",
      color: "#4f5e78",
      border: "1px solid #4f5e78"
    }
  },
  fontWeight: 500,
  fontStyle: "normal",
  fontStretch: "normal",
  lineHeight: "normal",
  letterSpacing: "normal"
};

export enum SHADOW {
  LEFT,
  RIGHT,
  CENTER
}

export type PlanType = {
  isCustom: boolean,
  borderColor: string,
  content: string,
  discountedUsdCost: number | null | undefined,
  durationInMonths: number,
  opctCost: number,
  includesDesktopApp: boolean,
  isAvailable: boolean,
  isHighlighted: boolean,
  permalink: string,
  shadow: SHADOW,
  specialPricing: string | null | undefined,
  storageInGB: number,
  storageLimit: string,
  title: string,
  usdCost: number,
  zIndex: number,
  features: string[]
};

export const PLANS: PlanType[] = [
  {
    isCustom: false,
    borderColor: "#ECCD32",
    content: "Discover secure file sharing using blockchain technology",
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
    title: "Free",
    usdCost: 0,
    zIndex: 0,
    features: [
      "End-to-End Encryption",
      "Unlimited Downloads",
      "Private File Sharing",
      "No 3rd Party Tracking",
      "Access Anywhere",
      "2GB File Size"
    ]
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
    title: "Basic",
    usdCost: 39.99,
    zIndex: 1,
    features: [
      "End-to-End Encryption",
      "Unlimited Downloads",
      "Private File Sharing",
      "No 3rd Party Tracking",
      "Access Anywhere",
      "2GB File Size"
    ]
  },
  {
    isCustom: false,
    borderColor: "#918DEA",
    content: "Secure and access your files anywhere",
    discountedUsdCost: 79.99,
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
      "Desktop Sync"
    ]
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
      "Desktop Sync"
    ]
  },
  {
    isCustom: false,
    borderColor: "#8ADB75",
    content: "All the secure file storage you need ",
    discountedUsdCost: null,
    durationInMonths: 12,
    opctCost: 0,
    includesDesktopApp: false,
    isAvailable: false,
    isHighlighted: false,
    permalink: "enterprise",
    shadow: SHADOW.RIGHT,
    specialPricing: "Custom Pricing",
    storageInGB: 9999,
    storageLimit: "Unlimited",
    title: "Enterprise",
    usdCost: 0,
    zIndex: 0,
    features: [
      "Opacity can provide the storage and services your business needs. S3 compliant API integrates easily with most existing implementations."
    ]
  },
  {
    isCustom: true,
    borderColor: "#918DEA",
    content: "Secure and access your files anywhere",
    discountedUsdCost: null,
    durationInMonths: 12,
    opctCost: 58000,
    includesDesktopApp: true,
    isAvailable: true,
    isHighlighted: true,
    permalink: "custom-10tb",
    shadow: SHADOW.CENTER,
    specialPricing: null,
    storageInGB: 20000,
    storageLimit: "20 TB",
    title: "Custom",
    usdCost: 400.0,
    zIndex: 2,
    features: [
      "End-to-End Encryption",
      "Unlimited Downloads",
      "Private File Sharing",
      "No 3rd Party Tracking",
      "Access Anywhere",
      "Unlimited File Size*",
      "Desktop Sync"
    ]
  }
];

// const ICON_FILE = require("../assets/images/file.svg");
// const ICON_JPG = require("../assets/images/jpg.svg");
// const ICON_PNG = require("../assets/images/png.svg");
// const ICON_PDF = require("../assets/images/pdf.svg");
// const ICON_DOC = require("../assets/images/doc.svg");

// export const DATA_TYPES_ICONS = [
//   {
//     name: ".none",
//     icon: ICON_FILE
//   },
//   {
//     name: ".jpg",
//     icon: ICON_JPG
//   },
//   {
//     name: ".pdf",
//     icon: ICON_PDF
//   },
//   {
//     name: ".doc",
//     icon: ICON_DOC
//   },
//   {
//     name: ".png",
//     icon: ICON_PNG
//   }
// ];

export enum DROP_TYPES {
  FILE,
  FOLDER
}

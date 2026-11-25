// Image paths configuration - Centralized image management
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
const IMG_BASE = `${BACKEND_URL}/uploads`;

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/EIS/admin';

/**
 * Prepends basePath to a relative public asset path if not already prepended.
 * Preserves absolute external URLs, protocol-relative URLs, and data/blob URIs.
 */
export const withBasePath = (path) => {
  if (!path || typeof path !== 'string') return path;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const cleanBase = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH;
  if (!cleanBase) return path;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === cleanBase || cleanPath.startsWith(`${cleanBase}/`)) {
    return cleanPath;
  }
  return `${cleanBase}${cleanPath}`;
};

export const IMAGES = {
  // Images folder
  ALL: {
    // Numbered images
    get: (num, format = 'jpg') => `${IMG_BASE}/Images/${num}.${format}`,

    // Specific images
    A: `${IMG_BASE}/Images/A.jpg`,
    A_GRAY: `${IMG_BASE}/Images/Agray.jpg`,
    C_GRAY: `${IMG_BASE}/Images/Cgray.jpg`,
    KEN: `${IMG_BASE}/Images/KEN.jpg`,
    KEN_PLUS: `${IMG_BASE}/Images/KEN+.jpg`,
    ORG_CHART: `${IMG_BASE}/Images/OrgChart.jpg`,

    // Roll images
    ROLL: {
      get: (num) => `${IMG_BASE}/Images/Roll${num}.jpg`,
      1: `${IMG_BASE}/Images/Roll1.jpg`,
      2: `${IMG_BASE}/Images/Roll2.jpg`,
      3: `${IMG_BASE}/Images/Roll3.jpg`,
      4: `${IMG_BASE}/Images/Roll4.jpg`,
      5: `${IMG_BASE}/Images/Roll5.jpg`,
      6: `${IMG_BASE}/Images/Roll6.jpg`,
      7: `${IMG_BASE}/Images/Roll7.jpg`,
      8: `${IMG_BASE}/Images/Roll8.jpg`,
      9: `${IMG_BASE}/Images/Roll9.jpg`,
      10: `${IMG_BASE}/Images/Roll10.jpg`,
      11: `${IMG_BASE}/Images/Roll11.jpg`,
    },

    // Uzzi images
    UZZI: {
      1: `${IMG_BASE}/Images/Uzzi1.jpg`,
      '1_GRAY': `${IMG_BASE}/Images/Uzzi1gray.jpg`,
      3: `${IMG_BASE}/Images/Uzzi3.jpg`,
      '3_GRAY': `${IMG_BASE}/Images/Uzzi3gray.jpg`,
      NET1: `${IMG_BASE}/Images/uzzinet1.png`,
      NET2: `${IMG_BASE}/Images/uzzinet2.png`,
      NET3: `${IMG_BASE}/Images/uzzinet3.png`,
    },

    // Profile images (PNG format - 1.png to 24.png)
    PROFILE: {
      get: (num) => `${IMG_BASE}/Images/${num}.png`,
      1: `${IMG_BASE}/Images/1.png`,
      2: `${IMG_BASE}/Images/2.png`,
      3: `${IMG_BASE}/Images/3.png`,
      4: `${IMG_BASE}/Images/4.png`,
      5: `${IMG_BASE}/Images/5.png`,
      6: `${IMG_BASE}/Images/6.png`,
      7: `${IMG_BASE}/Images/7.png`,
      8: `${IMG_BASE}/Images/8.png`,
      9: `${IMG_BASE}/Images/9.png`,
      10: `${IMG_BASE}/Images/10.png`,
      11: `${IMG_BASE}/Images/11.png`,
      12: `${IMG_BASE}/Images/12.png`,
      13: `${IMG_BASE}/Images/13.png`,
      14: `${IMG_BASE}/Images/14.png`,
      15: `${IMG_BASE}/Images/15.png`,
      16: `${IMG_BASE}/Images/16.png`,
      17: `${IMG_BASE}/Images/17.png`,
      18: `${IMG_BASE}/Images/18.png`,
      19: `${IMG_BASE}/Images/19.png`,
      20: `${IMG_BASE}/Images/20.png`,
      21: `${IMG_BASE}/Images/21.png`,
      22: `${IMG_BASE}/Images/22.png`,
      23: `${IMG_BASE}/Images/23.png`,
      24: `${IMG_BASE}/Images/24.png`,
    },

    // Profile images (JPG format - 1.jpg to 24.jpg)
    PROFILE_JPG: {
      get: (num) => `${IMG_BASE}/Images/${num}.jpg`,
      1: `${IMG_BASE}/Images/1.jpg`,
      2: `${IMG_BASE}/Images/2.jpg`,
      3: `${IMG_BASE}/Images/3.jpg`,
      4: `${IMG_BASE}/Images/4.jpg`,
      5: `${IMG_BASE}/Images/5.jpg`,
      6: `${IMG_BASE}/Images/6.jpg`,
      7: `${IMG_BASE}/Images/7.jpg`,
      8: `${IMG_BASE}/Images/8.jpg`,
      9: `${IMG_BASE}/Images/9.jpg`,
      10: `${IMG_BASE}/Images/10.jpg`,
      11: `${IMG_BASE}/Images/11.jpg`,
      12: `${IMG_BASE}/Images/12.jpg`,
      13: `${IMG_BASE}/Images/13.jpg`,
      14: `${IMG_BASE}/Images/14.jpg`,
      15: `${IMG_BASE}/Images/15.jpg`,
      16: `${IMG_BASE}/Images/16.jpg`,
      17: `${IMG_BASE}/Images/17.jpg`,
      18: `${IMG_BASE}/Images/18.jpg`,
      19: `${IMG_BASE}/Images/19.jpg`,
      20: `${IMG_BASE}/Images/20.jpg`,
      21: `${IMG_BASE}/Images/21.jpg`,
      22: `${IMG_BASE}/Images/22.jpg`,
      23: `${IMG_BASE}/Images/23.jpg`,
      24: `${IMG_BASE}/Images/24.jpg`,
    },

    // Dot images (colored dots)
    DOTS: {
      BEIGE: `${IMG_BASE}/Images/Dotbeige.jpg`,
      BLUE: `${IMG_BASE}/Images/Dotblue.jpg`,
      GREEN: `${IMG_BASE}/Images/Dotgreen.jpg`,
      LIGHT_BLUE: `${IMG_BASE}/Images/Dotlightblue.jpg`,
      LIGHT_GREEN: `${IMG_BASE}/Images/Dotlightgreen.jpg`,
      ORANGE: `${IMG_BASE}/Images/Dotorange.jpg`,
      RED: `${IMG_BASE}/Images/Dotred.jpg`,
      RED_REAL: `${IMG_BASE}/Images/Dotredreal.jpg`,
      YELLOW: `${IMG_BASE}/Images/Dotyellow.jpg`,
    },

    // Wallpaper images
    WP100: `${IMG_BASE}/Images/wp100.jpg`,
    WP100_ORIG: `${IMG_BASE}/Images/wp100orig.jpg`,

    // Icons
    ICONS: {
      ALPHA_SIM: `${IMG_BASE}/Images/AlphaSim.ico`,
      SCREEN_ICON: `${IMG_BASE}/Images/ScreenIcon4.png`,
      ROUND_BLACK: `${IMG_BASE}/Images/roundBlack.png`,
    },
  },

  // Sound effects
  SOUNDS: {
    CLICK: withBasePath('/new-sounds/click.wav'),
    EVENT: withBasePath('/new-sounds/event.wav'),
    OOPS: withBasePath('/new-sounds/oops.wav'),
    POINT: withBasePath('/new-sounds/point.wav'),
    SUCCESS: withBasePath('/new-sounds/success.wav'),
    TIME: withBasePath('/new-sounds/time.wav'),
    WTELL: withBasePath('/new-sounds/wtell.wav'),

    // Helper function to get sound by name
    get: (name) => withBasePath(`/new-sounds/${name}.wav`),
  },

  // Default images
  DEFAULTS: {
    FAVICON: withBasePath('/favicon.ico'),
    NEXT_LOGO: withBasePath('/next.svg'),
    VERCEL_LOGO: withBasePath('/vercel.svg'),
  },
};

// Helper function to get image path easily
export const getImage = (category, name) => {
  if (category === 'images') {
    return IMAGES.ALL[name] || `${IMG_BASE}/Images/${name}`;
  }
  if (category === 'sound') {
    return IMAGES.SOUNDS[name] || withBasePath(`/new-sounds/${name}`);
  }
  return null;
};

// Helper to preload images
export const preloadImages = (imagePaths) => {
  if (typeof window !== 'undefined') {
    imagePaths.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }
};

export default IMAGES;
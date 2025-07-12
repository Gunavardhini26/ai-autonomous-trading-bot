// Design System Configuration
export const theme = {
  // Light Mode (Default)
  light: {
    background: '#ffffff',
    text: '#1f2937',
    card: '#f8fafc',
    border: '#e2e8f0',
    primary: '#e11d48',
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    muted: '#64748b',
    accent: '#e11d48'
  },
  
  // Dark Mode
  dark: {
    background: '#0f172a',
    text: '#f1f5f9',
    card: '#1e293b',
    border: '#334155',
    primary: '#e11d48',
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    muted: '#94a3b8',
    accent: '#e11d48'
  },
  
  // Red Alert Mode (Loss threshold breached)
  alert: {
    background: '#1e0b0b',
    text: '#ffeaea',
    card: '#2d1414',
    border: '#441818',
    primary: '#ff1f3d',
    info: '#ff6b6b',
    success: '#10b981',
    warning: '#ffa726',
    danger: '#ff1f3d',
    muted: '#cc9999',
    accent: '#ff1f3d'
  }
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem'    // 64px
};

export const typography = {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};

export const borderRadius = {
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px'
};

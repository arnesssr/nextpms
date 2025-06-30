import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// PMS Logo Icon
export const PmsLogo: React.FC<IconProps> = ({ className = "h-6 w-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="16" r="16" fill="currentColor" />
    <rect x="8" y="10" width="16" height="12" rx="2" fill="none" stroke="white" strokeWidth="2"/>
    <path d="M8 14h16" stroke="white" strokeWidth="2"/>
    <circle cx="12" cy="17" r="1.5" fill="white"/>
    <circle cx="20" cy="17" r="1.5" fill="white"/>
    <rect x="14" y="6" width="4" height="2" rx="1" fill="white"/>
  </svg>
);

// Custom Dashboard Icon
export const DashboardIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" />
  </svg>
);

// Custom Products Icon
export const ProductsIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M3 11h18" stroke="currentColor" strokeWidth="2"/>
    <circle cx="8" cy="14" r="1" fill="currentColor"/>
    <circle cx="16" cy="14" r="1" fill="currentColor"/>
    <rect x="10" y="4" width="4" height="3" rx="1" fill="currentColor"/>
  </svg>
);

// Custom Categories Icon
export const CategoriesIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="15" y="3" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="3" y="15" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="15" y="15" width="6" height="6" rx="1" fill="currentColor" />
    <path d="M9 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 3v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Custom Orders Icon
export const OrdersIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M3 6h18" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Custom Inventory Icon
export const InventoryIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="7" cy="7" r="1" fill="currentColor"/>
    <circle cx="17" cy="7" r="1" fill="currentColor"/>
    <circle cx="7" cy="17" r="1" fill="currentColor"/>
    <circle cx="17" cy="17" r="1" fill="currentColor"/>
  </svg>
);

// Custom Suppliers Icon
export const SuppliersIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="1" y="6" width="22" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M1 10h22" stroke="currentColor" strokeWidth="2"/>
    <rect x="5" y="2" width="14" height="4" rx="1" fill="currentColor"/>
    <circle cx="8" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="14" r="1.5" fill="currentColor"/>
  </svg>
);

// Custom Analytics Icon
export const AnalyticsIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 17v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 7v-4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 13h6l3-3v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 17a9 9 0 00-9-9 9 9 0 00-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

// Custom Settings Icon
export const SettingsIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// Custom Profile Icon
export const ProfileIcon: React.FC<IconProps> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M20 21a8 8 0 00-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

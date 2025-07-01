import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

export const PriceIncreaseIcon: React.FC<IconProps> = ({ width = 20, height = 20, className = "" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="increaseGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style={{stopColor:"#4facfe", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#00f2fe", stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="increaseBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#667eea", stopOpacity:0.1}} />
        <stop offset="100%" style={{stopColor:"#764ba2", stopOpacity:0.1}} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#increaseBg)" stroke="url(#increaseGradient)" strokeWidth="1" opacity="0.8"/>
    <path d="M12 6 L18 14 L15 14 L15 18 L9 18 L9 14 L6 14 Z" fill="url(#increaseGradient)" opacity="0.9"/>
    <path d="M7 15 L17 9" stroke="url(#increaseGradient)" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
  </svg>
);

export const PriceDecreaseIcon: React.FC<IconProps> = ({ width = 20, height = 20, className = "" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="decreaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#ffecd2", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#fcb69f", stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="decreaseBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#667eea", stopOpacity:0.1}} />
        <stop offset="100%" style={{stopColor:"#764ba2", stopOpacity:0.1}} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#decreaseBg)" stroke="url(#decreaseGradient)" strokeWidth="1" opacity="0.8"/>
    <path d="M12 18 L6 10 L9 10 L9 6 L15 6 L15 10 L18 10 Z" fill="url(#decreaseGradient)" opacity="0.9"/>
    <path d="M17 9 L7 15" stroke="url(#decreaseGradient)" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
  </svg>
);

export const ApplyDiscountIcon: React.FC<IconProps> = ({ width = 20, height = 20, className = "" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="discountGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#a8edea", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#fed6e3", stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="discountBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#667eea", stopOpacity:0.1}} />
        <stop offset="100%" style={{stopColor:"#764ba2", stopOpacity:0.1}} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#discountBg)" stroke="url(#discountGradient)" strokeWidth="1" opacity="0.8"/>
    <path d="M5 8 L12 5 L19 8 L19 12 L12 19 L5 12 Z" fill="url(#discountGradient)" opacity="0.8"/>
    <circle cx="9" cy="9" r="1.5" fill="#ffffff" opacity="0.9"/>
    <circle cx="15" cy="15" r="1.5" fill="#ffffff" opacity="0.9"/>
    <path d="M7 17 L17 7" stroke="#ffffff" strokeWidth="2" opacity="0.9" strokeLinecap="round"/>
    <circle cx="6" cy="10" r="0.8" fill="url(#discountGradient)" opacity="0.6"/>
    <circle cx="18" cy="14" r="0.8" fill="url(#discountGradient)" opacity="0.6"/>
  </svg>
);

export const SetTargetMarginIcon: React.FC<IconProps> = ({ width = 20, height = 20, className = "" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#667eea", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#764ba2", stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="targetBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#667eea", stopOpacity:0.1}} />
        <stop offset="100%" style={{stopColor:"#764ba2", stopOpacity:0.1}} />
      </linearGradient>
      <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#4facfe", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#00f2fe", stopOpacity:1}} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#targetBg)" stroke="url(#targetGradient)" strokeWidth="1" opacity="0.8"/>
    <circle cx="12" cy="12" r="9" fill="none" stroke="url(#targetGradient)" strokeWidth="1" opacity="0.6"/>
    <circle cx="12" cy="12" r="6" fill="none" stroke="url(#targetGradient)" strokeWidth="1.5" opacity="0.7"/>
    <circle cx="12" cy="12" r="3" fill="none" stroke="url(#targetGradient)" strokeWidth="2" opacity="0.8"/>
    <circle cx="12" cy="12" r="2" fill="url(#centerGradient)" opacity="0.9"/>
    <path d="M12 3 L12 7" stroke="url(#targetGradient)" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
    <path d="M12 17 L12 21" stroke="url(#targetGradient)" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
    <path d="M3 12 L7 12" stroke="url(#targetGradient)" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
    <path d="M17 12 L21 12" stroke="url(#targetGradient)" strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
  </svg>
);

export const AddFixedAmountIcon: React.FC<IconProps> = ({ width = 20, height = 20, className = "" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="addGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#4facfe", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#00f2fe", stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="addBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#667eea", stopOpacity:0.1}} />
        <stop offset="100%" style={{stopColor:"#764ba2", stopOpacity:0.1}} />
      </linearGradient>
      <linearGradient id="currencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#a8edea", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#fed6e3", stopOpacity:1}} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#addBg)" stroke="url(#addGradient)" strokeWidth="1" opacity="0.8"/>
    <rect x="8" y="8" width="8" height="8" rx="2" fill="url(#currencyGradient)" opacity="0.7"/>
    <path d="M12 9 L12 15" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    <path d="M9 12 L15 12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="18" cy="6" r="2" fill="url(#addGradient)" opacity="0.6"/>
    <path d="M18 5 L18 7" stroke="#ffffff" strokeWidth="1" strokeLinecap="round"/>
    <path d="M17 6 L19 6" stroke="#ffffff" strokeWidth="1" strokeLinecap="round"/>
    <path d="M4 8 L8 10" stroke="url(#addGradient)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round"/>
    <path d="M16 14 L20 16" stroke="url(#addGradient)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round"/>
  </svg>
);

export const ReduceFixedAmountIcon: React.FC<IconProps> = ({ width = 20, height = 20, className = "" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="reduceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#ffecd2", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#fcb69f", stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="reduceBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#667eea", stopOpacity:0.1}} />
        <stop offset="100%" style={{stopColor:"#764ba2", stopOpacity:0.1}} />
      </linearGradient>
      <linearGradient id="currencyReduceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:"#a8edea", stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:"#fed6e3", stopOpacity:1}} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#reduceBg)" stroke="url(#reduceGradient)" strokeWidth="1" opacity="0.8"/>
    <rect x="8" y="8" width="8" height="8" rx="2" fill="url(#currencyReduceGradient)" opacity="0.7"/>
    <path d="M9 12 L15 12" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="6" cy="18" r="2" fill="url(#reduceGradient)" opacity="0.6"/>
    <path d="M5 18 L7 18" stroke="#ffffff" strokeWidth="1" strokeLinecap="round"/>
    <path d="M4 16 L8 14" stroke="url(#reduceGradient)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round"/>
    <path d="M16 10 L20 8" stroke="url(#reduceGradient)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round"/>
    <path d="M18 6 L20 8 L18 10" stroke="url(#reduceGradient)" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Export all icons as a collection for easy access
export const PricingIcons = {
  PriceIncrease: PriceIncreaseIcon,
  PriceDecrease: PriceDecreaseIcon,
  ApplyDiscount: ApplyDiscountIcon,
  SetTargetMargin: SetTargetMarginIcon,
  AddFixedAmount: AddFixedAmountIcon,
  ReduceFixedAmount: ReduceFixedAmountIcon,
};

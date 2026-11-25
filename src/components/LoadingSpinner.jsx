'use client';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-[#d4a017] border-t-transparent ${sizeClasses[size]}`}></div>
  );
};

export default LoadingSpinner;

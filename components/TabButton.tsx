
import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => {
  const baseClasses = 'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
  const activeClasses = 'bg-indigo-600 text-white shadow-sm';
  const inactiveClasses = 'bg-white text-slate-600 hover:bg-slate-100';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default TabButton;

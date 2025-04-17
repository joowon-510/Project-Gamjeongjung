// src/components/common/FloatingActionButton.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface FloatingActionButtonProps {
  to: string;
  icon: React.ReactNode;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ to, icon }) => {
  return (
    <Link 
      to={to} 
      className="absolute right-4 bottom-16 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
    >
      {icon}
    </Link>
  );
};

export default FloatingActionButton;
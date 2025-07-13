import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-50/50 backdrop-blur-sm border-t border-gray-200/30 text-center p-4">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs text-gray-500">
          {'Copyright © '}
          <span className="font-medium text-gray-600">
            Tool Time Management System
          </span>{' '}
          {new Date().getFullYear()}
          {'. All rights reserved.'}
        </p>
      </div>
    </footer>
  );
};

export default Footer;

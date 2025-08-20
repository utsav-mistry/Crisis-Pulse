import React from 'react';
import { useAlert } from '../context/AlertContext';

const GlobalAlert = () => {
  const { alert, hideAlert } = useAlert();

  if (!alert) return null;

  const alertStyles = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <div 
        className={`${alertStyles[alert.type] || alertStyles.info} border px-4 py-3 rounded relative`}
        role="alert"
      >
        <span className="block sm:inline">{alert.message}</span>
        <span 
          className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
          onClick={hideAlert}
        >
          <svg className="fill-current h-6 w-6" role="button" viewBox="0 0 20 20">
            <title>Close</title>
            <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 6.066 4.652a1 1 0 10-1.414 1.414L8.586 10l-3.934 3.934a1 1 0 101.414 1.414L10 11.414l3.934 3.934a1 1 0 001.414-1.414L11.414 10l3.934-3.934a1 1 0 000-1.414z" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default GlobalAlert;

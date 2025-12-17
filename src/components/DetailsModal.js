'use client';
import React from 'react';
import { CrossIcon } from 'lucide-react';

const DetailsModal = ({ onClose, data }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm h-screen w-screen"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-xl bg-white shadow-2xl animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-xl"
            >
              <CrossIcon/>
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 text-gray-700">
            {data}
          </div>

          
        </div>
      </div>
    </>
  );
};

export default DetailsModal;

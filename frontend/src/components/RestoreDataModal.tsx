import React from 'react';
import { X, RotateCcw, Trash2 } from 'lucide-react';

interface RestoreDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeepData: () => void;
  onDiscardData: () => void;
  savedFieldCount: number;
  savedTime: number;
}

const RestoreDataModal: React.FC<RestoreDataModalProps> = ({
  isOpen,
  onClose,
  onKeepData,
  onDiscardData,
  savedFieldCount,
  savedTime
}) => {
  if (!isOpen) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Previous Form Data Found
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-800 font-medium">
                We found your previous form data
              </p>
              <p className="text-sm text-gray-600">
                {savedFieldCount} fields saved {formatTime(savedTime)}
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            Would you like to continue where you left off, or start fresh?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onKeepData}
              className="flex-1 bg-vesoko_primary text-white px-4 py-2 rounded-md hover:bg-vesoko_primary transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Continue Previous
            </button>
            <button
              onClick={onDiscardData}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestoreDataModal;

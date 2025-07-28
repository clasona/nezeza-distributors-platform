import React, { useState, useEffect } from 'react';
import { Save, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isAutoSaving?: boolean;
  lastSavedTime?: number;
  savedFieldCount?: number;
  onClearSavedData?: () => void;
  className?: string;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isAutoSaving = false,
  lastSavedTime,
  savedFieldCount = 0,
  onClearSavedData,
  className = ''
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Update time ago display
  useEffect(() => {
    if (!lastSavedTime) return;

    const updateTimeAgo = () => {
      const now = Date.now();
      const diff = now - lastSavedTime;
      
      if (diff < 60000) { // Less than 1 minute
        setTimeAgo('just now');
      } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(diff / 3600000);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSavedTime]);

  if (!lastSavedTime && !isAutoSaving) return null;

  return (
    <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded bg-white/80 shadow-sm ${className}`}>
      {isAutoSaving ? (
        <>
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin">
              <Save className="h-4 w-4" />
            </div>
            <span>Saving...</span>
          </div>
        </>
      ) : lastSavedTime ? (
        <>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>
              Saved {timeAgo}
              {savedFieldCount > 0 && ` (${savedFieldCount} fields)`}
            </span>
          </div>
          {onClearSavedData && (
            <button
              type="button"
              onClick={onClearSavedData}
              className="text-xs text-gray-500 hover:text-red-600 underline ml-2"
              title="Clear saved data"
            >
              Clear
            </button>
          )}
        </>
      ) : null}
    </div>
  );
};

export default AutoSaveIndicator;

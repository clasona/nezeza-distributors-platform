import { useEffect, useRef, useCallback } from 'react';
import { UseFormWatch, UseFormSetValue, FieldValues, Path } from 'react-hook-form';

interface UseFormAutoSaveOptions<T extends FieldValues> {
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  key: string;
  delay?: number; // Debounce delay in milliseconds
  exclude?: (keyof T)[]; // Fields to exclude from auto-save
  onSave?: (data: Partial<T>) => void; // Callback when data is saved
  onRestore?: (data: Partial<T>) => void; // Callback when data is restored
}

export function useFormAutoSave<T extends FieldValues>({
  watch,
  setValue,
  key,
  delay = 1000,
  exclude = [],
  onSave,
  onRestore,
}: UseFormAutoSaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const hasRestoredRef = useRef(false);

  // Watch all form values
  const formData = watch();

  // Save data to localStorage
  const saveToStorage = useCallback((data: Partial<T>) => {
    try {
      const filteredData = { ...data };
      
      // Remove excluded fields
      exclude.forEach(field => {
        delete filteredData[field];
      });

      // Remove empty strings and null values to keep storage clean
      const cleanData = Object.entries(filteredData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      if (Object.keys(cleanData).length > 0) {
        localStorage.setItem(key, JSON.stringify({
          data: cleanData,
          timestamp: Date.now(),
          version: '1.0' // For future compatibility
        }));
        
        onSave?.(cleanData);
      }
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }, [key, exclude, onSave]);

  // Load data from localStorage
  const loadFromStorage = useCallback((): Partial<T> | null => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      // Check if data is too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
      localStorage.removeItem(key); // Remove corrupted data
      return null;
    }
  }, [key]);

  // Restore saved data on component mount
  useEffect(() => {
    if (!hasRestoredRef.current) {
      const savedData = loadFromStorage();
      if (savedData) {
        // Restore each field individually
        Object.entries(savedData).forEach(([fieldName, value]) => {
          setValue(fieldName as Path<T>, value);
        });
        
        onRestore?.(savedData);
      }
      hasRestoredRef.current = true;
    }
  }, [loadFromStorage, setValue, onRestore]);

  // Auto-save with debouncing
  useEffect(() => {
    if (!hasRestoredRef.current) return; // Don't save during initial load

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveToStorage(formData);
    }, delay);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, delay, saveToStorage]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  }, [key]);

  // Check if there's saved data
  const hasSavedData = useCallback((): boolean => {
    return loadFromStorage() !== null;
  }, [loadFromStorage]);

  // Get saved data info
  const getSavedDataInfo = useCallback(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        timestamp: parsed.timestamp,
        fieldCount: Object.keys(parsed.data || {}).length,
        age: Date.now() - parsed.timestamp
      };
    } catch {
      return null;
    }
  }, [key]);

  return {
    clearSavedData,
    hasSavedData,
    getSavedDataInfo,
    saveToStorage: () => saveToStorage(formData) // Manual save trigger
  };
}

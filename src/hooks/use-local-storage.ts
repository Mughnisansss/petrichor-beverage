"use client";

import { useState, useEffect, useCallback } from "react";

// This is a helper function to safely parse JSON
function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) {
    return fallback;
  }
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error("Failed to parse JSON, returning fallback.", e);
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? safeJsonParse(item, initialValue) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // This effect runs once on the client to set the initial value.
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window == "undefined") {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
    }

    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      window.localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
      // We dispatch a custom event so other tabs can sync
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };


  // This effect listens for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
       if (e.key === key) {
         setStoredValue(readValue());
       }
    };
    
    const handleCustomEvent = () => {
        setStoredValue(readValue());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleCustomEvent);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}

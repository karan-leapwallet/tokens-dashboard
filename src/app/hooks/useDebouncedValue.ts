import { useEffect, useState } from "react";

/**
 * React hook to get debounced value
 *
 * @param value The value to be debounced
 * @param delay The delay in milliseconds
 *
 * @returns Debounced value
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

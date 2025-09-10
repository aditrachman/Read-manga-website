"use client";
import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('LCP:', entry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value);
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }, []);

  return null;
}
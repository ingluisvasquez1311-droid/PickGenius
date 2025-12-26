/**
 * Utilidades de optimización de performance
 */

import { useEffect, useRef } from 'react';

/**
 * Hook para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook para throttle de funciones
 */
export function useThrottle<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useRef((...args: Parameters<T>) => {
        if (timeoutRef.current) return;

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
            timeoutRef.current = null;
        }, delay);
    }).current as T;
}

/**
 * Intersection Observer hook para lazy loading
 */
export function useIntersectionObserver(
    elementRef: React.RefObject<Element>,
    options?: IntersectionObserverInit
) {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [elementRef, options]);

    return isIntersecting;
}

/**
 * Medir performance de componentes
 */
export function measurePerformance(componentName: string, callback: () => void) {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
        callback();
        return;
    }

    const startTime = performance.now();
    callback();
    const endTime = performance.now();

    console.log(`[Performance] ${componentName}: ${(endTime - startTime).toFixed(2)}ms`);
}

/**
 * Preload de recursos críticos
 */
export function preloadResource(href: string, as: string) {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
}

/**
 * Prefetch de rutas para navegación más rápida
 */
export function prefetchRoute(href: string) {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
}

/**
 * Optimización de scroll - requestAnimationFrame
 */
export function useOptimizedScroll(callback: (scrollY: number) => void) {
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    callback(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [callback]);
}

// Necesario importar useState
import { useState } from 'react';

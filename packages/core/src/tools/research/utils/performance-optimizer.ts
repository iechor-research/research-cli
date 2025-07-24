/**
 * @license
 * Copyright 2025 iEchor LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Performance optimization utilities for research tools
 */

import { LRUCache } from 'lru-cache';

/**
 * Cache configuration for different types of data
 */
const CACHE_CONFIGS = {
  search_results: {
    max: 100,
    ttl: 1000 * 60 * 15, // 15 minutes
  },
  analysis_results: {
    max: 50,
    ttl: 1000 * 60 * 30, // 30 minutes
  },
  bibliography_data: {
    max: 200,
    ttl: 1000 * 60 * 60, // 1 hour
  },
  journal_matches: {
    max: 100,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
  },
  latex_compilation: {
    max: 20,
    ttl: 1000 * 60 * 10, // 10 minutes
  },
};

/**
 * Global cache instances
 */
const caches = new Map<string, LRUCache<string, any>>();

/**
 * Get or create cache instance
 */
function getCache(type: keyof typeof CACHE_CONFIGS): LRUCache<string, any> {
  if (!caches.has(type)) {
    caches.set(type, new LRUCache(CACHE_CONFIGS[type]));
  }
  return caches.get(type)!;
}

/**
 * Cache decorator for expensive operations
 */
export function cached(cacheType: keyof typeof CACHE_CONFIGS) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const cache = getCache(cacheType);

    descriptor.value = async function (...args: any[]) {
      // Create cache key from method name and arguments
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;

      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        console.debug(`Cache hit for ${propertyKey}`);
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Cache the result
      cache.set(cacheKey, result);
      console.debug(`Cached result for ${propertyKey}`);

      return result;
    };

    return descriptor;
  };
}

/**
 * Batch processing utility
 */
export class BatchProcessor<T, R> {
  private queue: Array<{
    item: T;
    resolve: (value: R) => void;
    reject: (error: Error) => void;
  }> = [];

  private processing = false;
  private batchSize: number;
  private delay: number;

  constructor(
    private processor: (items: T[]) => Promise<R[]>,
    batchSize = 10,
    delay = 100,
  ) {
    this.batchSize = batchSize;
    this.delay = delay;
  }

  async process(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push({ item, resolve, reject });
      this.scheduleProcessing();
    });
  }

  private scheduleProcessing() {
    if (this.processing) return;

    this.processing = true;
    setTimeout(() => this.processBatch(), this.delay);
  }

  private async processBatch() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    const batch = this.queue.splice(0, this.batchSize);
    const items = batch.map((b) => b.item);

    try {
      const results = await this.processor(items);

      batch.forEach((b, index) => {
        b.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach((b) => {
        b.reject(error as Error);
      });
    }

    // Schedule next batch if there are more items
    if (this.queue.length > 0) {
      setTimeout(() => this.processBatch(), this.delay);
    } else {
      this.processing = false;
    }
  }
}

/**
 * Memory-efficient data streaming
 */
export class DataStreamer<T> {
  private buffer: T[] = [];
  private bufferSize: number;
  private onChunk: (chunk: T[]) => Promise<void>;

  constructor(onChunk: (chunk: T[]) => Promise<void>, bufferSize = 1000) {
    this.onChunk = onChunk;
    this.bufferSize = bufferSize;
  }

  async add(item: T): Promise<void> {
    this.buffer.push(item);

    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length > 0) {
      await this.onChunk(this.buffer);
      this.buffer = [];
    }
  }
}

/**
 * Parallel processing with concurrency control
 */
export class ParallelProcessor<T, R> {
  private concurrency: number;
  private running = 0;
  private queue: Array<() => Promise<R>> = [];
  private results: R[] = [];

  constructor(concurrency = 5) {
    this.concurrency = concurrency;
  }

  async process(items: T[], processor: (item: T) => Promise<R>): Promise<R[]> {
    this.results = [];
    this.queue = items.map((item) => () => processor(item));

    const promises: Promise<void>[] = [];
    for (let i = 0; i < Math.min(this.concurrency, this.queue.length); i++) {
      promises.push(this.worker());
    }

    await Promise.all(promises);
    return this.results;
  }

  private async worker(): Promise<void> {
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      this.running++;
      try {
        const result = await task();
        this.results.push(result);
      } catch (error) {
        console.error('Parallel processing error:', error);
      } finally {
        this.running--;
      }
    }
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<
    string,
    {
      count: number;
      totalTime: number;
      avgTime: number;
      minTime: number;
      maxTime: number;
    }
  > = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): () => void {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.recordMetric(operation, duration);
    };
  }

  private recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation);

    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.avgTime = existing.totalTime / existing.count;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
    } else {
      this.metrics.set(operation, {
        count: 1,
        totalTime: duration,
        avgTime: duration,
        minTime: duration,
        maxTime: duration,
      });
    }
  }

  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    this.metrics.forEach((value, key) => {
      result[key] = { ...value };
    });
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

/**
 * Performance monitoring decorator
 */
export function monitored(operation?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const monitor = PerformanceMonitor.getInstance();
    const operationName =
      operation || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const stopTimer = monitor.startTimer(operationName);

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        stopTimer();
      }
    };

    return descriptor;
  };
}

/**
 * Memory usage optimizer
 */
export class MemoryOptimizer {
  private static readonly MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB
  private static readonly GC_INTERVAL = 30000; // 30 seconds

  private static gcTimer: NodeJS.Timeout | null = null;

  static startMemoryMonitoring(): void {
    if (this.gcTimer) return;

    this.gcTimer = setInterval(() => {
      const memUsage = process.memoryUsage();

      if (memUsage.heapUsed > this.MEMORY_THRESHOLD) {
        console.warn(
          'High memory usage detected, suggesting garbage collection',
        );

        // Clear caches
        caches.forEach((cache) => cache.clear());

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
    }, this.GC_INTERVAL);
  }

  static stopMemoryMonitoring(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
  }

  static getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }
}

/**
 * Debounced function executor
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): T {
  let timeoutId: NodeJS.Timeout;

  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  } as T;
}

/**
 * Throttled function executor
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): T {
  let inThrottle: boolean;

  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as T;
}

/**
 * Export utility functions
 */
export { getCache, CACHE_CONFIGS };

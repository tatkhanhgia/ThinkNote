export interface ChunkProcessingOptions {
  chunkSize?: number;
  delayBetweenChunks?: number;
  onProgress?: (progress: number, processedChunks: number, totalChunks: number) => void;
  onChunkProcessed?: (chunkIndex: number, result: any) => void;
}

export interface ProcessingResult<T> {
  results: T[];
  totalProcessingTime: number;
  chunksProcessed: number;
  errors: Error[];
}

export class ChunkedProcessor {
  /**
   * Process large content in chunks to prevent UI blocking
   */
  static async processInChunks<T>(
    content: string,
    processor: (chunk: string, chunkIndex: number) => Promise<T> | T,
    options: ChunkProcessingOptions = {}
  ): Promise<ProcessingResult<T>> {
    const {
      chunkSize = 10000, // 10KB chunks by default
      delayBetweenChunks = 10, // 10ms delay
      onProgress,
      onChunkProcessed
    } = options;

    const startTime = performance.now();
    const chunks = this.splitIntoChunks(content, chunkSize);
    const results: T[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < chunks.length; i++) {
      try {
        const result = await processor(chunks[i], i);
        results.push(result);
        
        if (onChunkProcessed) {
          onChunkProcessed(i, result);
        }

        if (onProgress) {
          const progress = ((i + 1) / chunks.length) * 100;
          onProgress(progress, i + 1, chunks.length);
        }

        // Add delay to prevent blocking the main thread
        if (delayBetweenChunks > 0 && i < chunks.length - 1) {
          await this.delay(delayBetweenChunks);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);
        
        // Continue processing other chunks even if one fails
        results.push(null as T);
      }
    }

    const endTime = performance.now();

    return {
      results,
      totalProcessingTime: endTime - startTime,
      chunksProcessed: chunks.length,
      errors
    };
  }

  /**
   * Process array items in batches
   */
  static async processBatch<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R> | R,
    batchSize: number = 10,
    delayBetweenBatches: number = 0
  ): Promise<ProcessingResult<R>> {
    const startTime = performance.now();
    const results: R[] = [];
    const errors: Error[] = [];
    let processedBatches = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.all(
          batch.map((item, index) => processor(item, i + index))
        );
        results.push(...batchResults);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);
        
        // Add null results for failed batch
        results.push(...new Array(batch.length).fill(null));
      }

      processedBatches++;

      if (delayBetweenBatches > 0 && i + batchSize < items.length) {
        await this.delay(delayBetweenBatches);
      }
    }

    const endTime = performance.now();

    return {
      results,
      totalProcessingTime: endTime - startTime,
      chunksProcessed: processedBatches,
      errors
    };
  }

  /**
   * Split content into chunks of specified size
   */
  private static splitIntoChunks(content: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  /**
   * Create a delay using Promise
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Estimate processing time based on content size
   */
  static estimateProcessingTime(contentSize: number, baseTimePerKB: number = 1): number {
    const sizeInKB = contentSize / 1024;
    return Math.ceil(sizeInKB * baseTimePerKB);
  }

  /**
   * Check if content should be processed in chunks
   */
  static shouldUseChunkedProcessing(contentSize: number, threshold: number = 50000): boolean {
    return contentSize > threshold;
  }
}

/**
 * Lazy loading utility for components
 */
export class LazyLoader {
  private static loadedComponents = new Map<string, any>();
  private static loadingPromises = new Map<string, Promise<any>>();

  /**
   * Lazy load a component with caching
   */
  static async loadComponent<T>(
    componentId: string,
    loader: () => Promise<T>
  ): Promise<T> {
    // Return cached component if already loaded
    if (this.loadedComponents.has(componentId)) {
      return this.loadedComponents.get(componentId);
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(componentId)) {
      return this.loadingPromises.get(componentId);
    }

    // Start loading and cache the promise
    const loadingPromise = loader().then(component => {
      this.loadedComponents.set(componentId, component);
      this.loadingPromises.delete(componentId);
      return component;
    }).catch(error => {
      this.loadingPromises.delete(componentId);
      throw error;
    });

    this.loadingPromises.set(componentId, loadingPromise);
    return loadingPromise;
  }

  /**
   * Preload components that might be needed soon
   */
  static preloadComponent<T>(
    componentId: string,
    loader: () => Promise<T>
  ): void {
    if (!this.loadedComponents.has(componentId) && !this.loadingPromises.has(componentId)) {
      this.loadComponent(componentId, loader).catch(() => {
        // Ignore preload errors
      });
    }
  }

  /**
   * Clear component cache
   */
  static clearCache(componentId?: string): void {
    if (componentId) {
      this.loadedComponents.delete(componentId);
      this.loadingPromises.delete(componentId);
    } else {
      this.loadedComponents.clear();
      this.loadingPromises.clear();
    }
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  /**
   * Start measuring performance
   */
  static startMeasurement(id: string): void {
    this.measurements.set(id, performance.now());
  }

  /**
   * End measurement and return duration
   */
  static endMeasurement(id: string): number {
    const startTime = this.measurements.get(id);
    if (!startTime) {
      throw new Error(`No measurement started for id: ${id}`);
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(id);
    return duration;
  }

  /**
   * Measure function execution time
   */
  static async measureAsync<T>(
    fn: () => Promise<T>,
    id?: string
  ): Promise<{ result: T; duration: number }> {
    const measurementId = id || `measurement_${Date.now()}`;
    this.startMeasurement(measurementId);
    
    try {
      const result = await fn();
      const duration = this.endMeasurement(measurementId);
      return { result, duration };
    } catch (error) {
      this.measurements.delete(measurementId);
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  static measure<T>(
    fn: () => T,
    id?: string
  ): { result: T; duration: number } {
    const measurementId = id || `measurement_${Date.now()}`;
    this.startMeasurement(measurementId);
    
    try {
      const result = fn();
      const duration = this.endMeasurement(measurementId);
      return { result, duration };
    } catch (error) {
      this.measurements.delete(measurementId);
      throw error;
    }
  }
}
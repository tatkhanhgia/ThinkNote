import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChunkedProcessor, LazyLoader, PerformanceMonitor } from '../ChunkedProcessor';

describe('ChunkedProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processInChunks', () => {
    it('should process content in chunks', async () => {
      const content = 'a'.repeat(30000); // 30KB content
      const processor = vi.fn().mockImplementation((chunk: string, index: number) => 
        Promise.resolve(`processed-${index}-${chunk.length}`)
      );

      const result = await ChunkedProcessor.processInChunks(content, processor, {
        chunkSize: 10000,
        delayBetweenChunks: 0
      });

      expect(result.results).toHaveLength(3);
      expect(result.results[0]).toBe('processed-0-10000');
      expect(result.results[1]).toBe('processed-1-10000');
      expect(result.results[2]).toBe('processed-2-10000');
      expect(result.chunksProcessed).toBe(3);
      expect(result.errors).toHaveLength(0);
      expect(processor).toHaveBeenCalledTimes(3);
    });

    it('should handle processing errors gracefully', async () => {
      const content = 'a'.repeat(20000);
      const processor = vi.fn().mockImplementation((chunk: string, index: number) => {
        if (index === 1) {
          throw new Error('Processing error');
        }
        return Promise.resolve(`processed-${index}`);
      });

      const result = await ChunkedProcessor.processInChunks(content, processor, {
        chunkSize: 10000,
        delayBetweenChunks: 0
      });

      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toBe('processed-0');
      expect(result.results[1]).toBeNull();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Processing error');
    });

    it('should call progress callback', async () => {
      const content = 'a'.repeat(20000);
      const processor = vi.fn().mockResolvedValue('processed');
      const onProgress = vi.fn();

      await ChunkedProcessor.processInChunks(content, processor, {
        chunkSize: 10000,
        delayBetweenChunks: 0,
        onProgress
      });

      expect(onProgress).toHaveBeenCalledWith(50, 1, 2);
      expect(onProgress).toHaveBeenCalledWith(100, 2, 2);
    });

    it('should call chunk processed callback', async () => {
      const content = 'a'.repeat(10000);
      const processor = vi.fn().mockResolvedValue('processed');
      const onChunkProcessed = vi.fn();

      await ChunkedProcessor.processInChunks(content, processor, {
        chunkSize: 10000,
        delayBetweenChunks: 0,
        onChunkProcessed
      });

      expect(onChunkProcessed).toHaveBeenCalledWith(0, 'processed');
    });
  });

  describe('processBatch', () => {
    it('should process items in batches', async () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const processor = vi.fn().mockImplementation((item: number) => 
        Promise.resolve(item * 2)
      );

      const result = await ChunkedProcessor.processBatch(items, processor, 10, 0);

      expect(result.results).toHaveLength(25);
      expect(result.results[0]).toBe(0);
      expect(result.results[24]).toBe(48);
      expect(result.chunksProcessed).toBe(3); // 3 batches: 10, 10, 5
      expect(processor).toHaveBeenCalledTimes(25);
    });

    it('should handle batch processing errors', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = vi.fn().mockImplementation((item: number) => {
        if (item === 3) {
          throw new Error('Batch error');
        }
        return Promise.resolve(item * 2);
      });

      const result = await ChunkedProcessor.processBatch(items, processor, 2, 0);

      expect(result.results).toHaveLength(5);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Batch error');
    });
  });

  describe('shouldUseChunkedProcessing', () => {
    it('should return true for large content', () => {
      expect(ChunkedProcessor.shouldUseChunkedProcessing(100000, 50000)).toBe(true);
    });

    it('should return false for small content', () => {
      expect(ChunkedProcessor.shouldUseChunkedProcessing(30000, 50000)).toBe(false);
    });
  });

  describe('estimateProcessingTime', () => {
    it('should estimate processing time based on content size', () => {
      const time = ChunkedProcessor.estimateProcessingTime(10240, 2); // 10KB, 2ms per KB
      expect(time).toBe(20);
    });
  });
});

describe('LazyLoader', () => {
  beforeEach(() => {
    LazyLoader.clearCache();
  });

  describe('loadComponent', () => {
    it('should load and cache component', async () => {
      const mockComponent = { name: 'TestComponent' };
      const loader = vi.fn().mockResolvedValue(mockComponent);

      const result1 = await LazyLoader.loadComponent('test', loader);
      const result2 = await LazyLoader.loadComponent('test', loader);

      expect(result1).toBe(mockComponent);
      expect(result2).toBe(mockComponent);
      expect(loader).toHaveBeenCalledTimes(1); // Should be cached
    });

    it('should handle loading errors', async () => {
      const loader = vi.fn().mockRejectedValue(new Error('Load error'));

      await expect(LazyLoader.loadComponent('test', loader)).rejects.toThrow('Load error');
    });

    it('should return same promise for concurrent loads', async () => {
      const mockComponent = { name: 'TestComponent' };
      const loader = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockComponent), 100))
      );

      const promise1 = LazyLoader.loadComponent('test', loader);
      const promise2 = LazyLoader.loadComponent('test', loader);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe(mockComponent);
      expect(result2).toBe(mockComponent);
      expect(loader).toHaveBeenCalledTimes(1);
    });
  });

  describe('preloadComponent', () => {
    it('should preload component without waiting', () => {
      const loader = vi.fn().mockResolvedValue({ name: 'PreloadedComponent' });

      LazyLoader.preloadComponent('preload-test', loader);

      expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should not preload if already loaded', async () => {
      const loader1 = vi.fn().mockResolvedValue({ name: 'Component1' });
      const loader2 = vi.fn().mockResolvedValue({ name: 'Component2' });

      await LazyLoader.loadComponent('test', loader1);
      LazyLoader.preloadComponent('test', loader2);

      expect(loader1).toHaveBeenCalledTimes(1);
      expect(loader2).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear specific component from cache', async () => {
      const loader = vi.fn().mockResolvedValue({ name: 'TestComponent' });

      await LazyLoader.loadComponent('test', loader);
      LazyLoader.clearCache('test');
      await LazyLoader.loadComponent('test', loader);

      expect(loader).toHaveBeenCalledTimes(2);
    });

    it('should clear all components from cache', async () => {
      const loader1 = vi.fn().mockResolvedValue({ name: 'Component1' });
      const loader2 = vi.fn().mockResolvedValue({ name: 'Component2' });

      await LazyLoader.loadComponent('test1', loader1);
      await LazyLoader.loadComponent('test2', loader2);
      
      LazyLoader.clearCache();
      
      await LazyLoader.loadComponent('test1', loader1);
      await LazyLoader.loadComponent('test2', loader2);

      expect(loader1).toHaveBeenCalledTimes(2);
      expect(loader2).toHaveBeenCalledTimes(2);
    });
  });
});

describe('PerformanceMonitor', () => {
  describe('measureAsync', () => {
    it('should measure async function execution time', async () => {
      const asyncFn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('result'), 100))
      );

      const { result, duration } = await PerformanceMonitor.measureAsync(asyncFn);

      expect(result).toBe('result');
      expect(duration).toBeGreaterThan(90);
      expect(duration).toBeLessThan(200);
    });

    it('should handle async function errors', async () => {
      const asyncFn = vi.fn().mockRejectedValue(new Error('Async error'));

      await expect(PerformanceMonitor.measureAsync(asyncFn)).rejects.toThrow('Async error');
    });
  });

  describe('measure', () => {
    it('should measure sync function execution time', () => {
      const syncFn = vi.fn().mockImplementation(() => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      const { result, duration } = PerformanceMonitor.measure(syncFn);

      expect(result).toBe(499500);
      expect(duration).toBeGreaterThan(0);
    });

    it('should handle sync function errors', () => {
      const syncFn = vi.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });

      expect(() => PerformanceMonitor.measure(syncFn)).toThrow('Sync error');
    });
  });

  describe('startMeasurement and endMeasurement', () => {
    it('should measure time between start and end', () => {
      PerformanceMonitor.startMeasurement('test');
      
      // Simulate some work
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      
      const duration = PerformanceMonitor.endMeasurement('test');

      expect(duration).toBeGreaterThan(0);
    });

    it('should throw error for non-existent measurement', () => {
      expect(() => PerformanceMonitor.endMeasurement('non-existent')).toThrow(
        'No measurement started for id: non-existent'
      );
    });
  });
});
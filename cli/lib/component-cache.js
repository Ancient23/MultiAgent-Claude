const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * ComponentCache - Caching system for composed prompts and components
 */
class ComponentCache {
    constructor(cacheDir) {
        this.cacheDir = cacheDir || path.join(process.cwd(), '.cache', 'prompts');
        this.memoryCache = new Map();
        this.maxMemoryItems = 100;
        this.maxAge = 3600000; // 1 hour default
        this.stats = {
            hits: 0,
            misses: 0,
            writes: 0,
            evictions: 0
        };
    }

    /**
     * Initialize cache directory
     */
    async init() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
        } catch (error) {
            console.warn(`Failed to create cache directory: ${error.message}`);
        }
    }

    /**
     * Get item from cache
     * @param {string} key - Cache key
     * @returns {Promise<string|null>} - Cached value or null
     */
    async get(key) {
        // Check memory cache first
        if (this.memoryCache.has(key)) {
            const cached = this.memoryCache.get(key);
            if (Date.now() - cached.timestamp < this.maxAge) {
                this.stats.hits++;
                // Move to front (LRU)
                this.memoryCache.delete(key);
                this.memoryCache.set(key, cached);
                return cached.value;
            } else {
                // Expired
                this.memoryCache.delete(key);
            }
        }

        // Check disk cache
        try {
            const filePath = this.getFilePath(key);
            const stat = await fs.stat(filePath);
            
            if (Date.now() - stat.mtime.getTime() < this.maxAge) {
                const value = await fs.readFile(filePath, 'utf8');
                
                // Add to memory cache
                this.addToMemoryCache(key, value);
                this.stats.hits++;
                return value;
            } else {
                // Expired, delete file
                await fs.unlink(filePath).catch(() => {});
            }
        } catch (error) {
            // File doesn't exist or error reading
        }

        this.stats.misses++;
        return null;
    }

    /**
     * Set item in cache
     * @param {string} key - Cache key
     * @param {string} value - Value to cache
     * @returns {Promise<void>}
     */
    async set(key, value) {
        // Add to memory cache
        this.addToMemoryCache(key, value);
        
        // Write to disk cache
        try {
            await this.init();
            const filePath = this.getFilePath(key);
            await fs.writeFile(filePath, value, 'utf8');
            this.stats.writes++;
        } catch (error) {
            console.warn(`Failed to write cache to disk: ${error.message}`);
        }
    }

    /**
     * Add item to memory cache with LRU eviction
     */
    addToMemoryCache(key, value) {
        // Remove if exists (to update position)
        if (this.memoryCache.has(key)) {
            this.memoryCache.delete(key);
        }
        
        // Add to end
        this.memoryCache.set(key, {
            value,
            timestamp: Date.now()
        });
        
        // Evict oldest if over limit
        if (this.memoryCache.size > this.maxMemoryItems) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
            this.stats.evictions++;
        }
    }

    /**
     * Delete item from cache
     * @param {string} key - Cache key
     * @returns {Promise<void>}
     */
    async delete(key) {
        // Remove from memory cache
        this.memoryCache.delete(key);
        
        // Remove from disk cache
        try {
            const filePath = this.getFilePath(key);
            await fs.unlink(filePath);
        } catch (error) {
            // File doesn't exist or error deleting
        }
    }

    /**
     * Clear all cache
     * @returns {Promise<void>}
     */
    async clear() {
        // Clear memory cache
        this.memoryCache.clear();
        
        // Clear disk cache
        try {
            const files = await fs.readdir(this.cacheDir);
            await Promise.all(
                files.map(file => fs.unlink(path.join(this.cacheDir, file)).catch(() => {}))
            );
        } catch (error) {
            // Directory doesn't exist or error clearing
        }
        
        // Reset stats
        this.stats = {
            hits: 0,
            misses: 0,
            writes: 0,
            evictions: 0
        };
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0;
            
        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            memoryCacheSize: this.memoryCache.size
        };
    }

    /**
     * Get file path for cache key
     */
    getFilePath(key) {
        // Hash the key to avoid filesystem issues
        const hash = crypto.createHash('md5').update(key).digest('hex');
        return path.join(this.cacheDir, `${hash}.cache`);
    }

    /**
     * Prune expired cache entries
     * @returns {Promise<number>} - Number of entries pruned
     */
    async prune() {
        let pruned = 0;
        
        // Prune memory cache
        for (const [key, cached] of this.memoryCache.entries()) {
            if (Date.now() - cached.timestamp >= this.maxAge) {
                this.memoryCache.delete(key);
                pruned++;
            }
        }
        
        // Prune disk cache
        try {
            const files = await fs.readdir(this.cacheDir);
            for (const file of files) {
                const filePath = path.join(this.cacheDir, file);
                const stat = await fs.stat(filePath);
                if (Date.now() - stat.mtime.getTime() >= this.maxAge) {
                    await fs.unlink(filePath).catch(() => {});
                    pruned++;
                }
            }
        } catch (error) {
            // Directory doesn't exist or error pruning
        }
        
        return pruned;
    }

    /**
     * Get cache size information
     * @returns {Promise<Object>} - Size information
     */
    async getSize() {
        let diskSize = 0;
        let fileCount = 0;
        
        try {
            const files = await fs.readdir(this.cacheDir);
            for (const file of files) {
                const filePath = path.join(this.cacheDir, file);
                const stat = await fs.stat(filePath);
                diskSize += stat.size;
                fileCount++;
            }
        } catch (error) {
            // Directory doesn't exist
        }
        
        // Estimate memory size
        let memorySize = 0;
        for (const cached of this.memoryCache.values()) {
            memorySize += cached.value.length * 2; // Rough estimate (UTF-16)
        }
        
        return {
            memoryItems: this.memoryCache.size,
            memorySize: this.formatSize(memorySize),
            diskFiles: fileCount,
            diskSize: this.formatSize(diskSize),
            totalSize: this.formatSize(memorySize + diskSize)
        };
    }

    /**
     * Format size in bytes to human readable
     */
    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * Warm cache with frequently used items
     * @param {Array} items - Array of {key, value} objects
     * @returns {Promise<void>}
     */
    async warmCache(items) {
        for (const { key, value } of items) {
            await this.set(key, value);
        }
    }

    /**
     * Export cache contents
     * @returns {Promise<Object>} - Exported cache data
     */
    async export() {
        const exported = {
            memory: [],
            disk: [],
            stats: this.getStats(),
            timestamp: new Date().toISOString()
        };
        
        // Export memory cache
        for (const [key, cached] of this.memoryCache.entries()) {
            exported.memory.push({
                key,
                timestamp: cached.timestamp,
                size: cached.value.length
            });
        }
        
        // Export disk cache metadata
        try {
            const files = await fs.readdir(this.cacheDir);
            for (const file of files) {
                const filePath = path.join(this.cacheDir, file);
                const stat = await fs.stat(filePath);
                exported.disk.push({
                    file,
                    size: stat.size,
                    modified: stat.mtime.toISOString()
                });
            }
        } catch (error) {
            // Directory doesn't exist
        }
        
        return exported;
    }
}

module.exports = ComponentCache;
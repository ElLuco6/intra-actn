import { Injectable } from '@angular/core';
import { HttpEvent } from "@angular/common/http";

const TTL = 3_000;

interface CacheEntry {
  value: HttpEvent<unknown>;
  expiresOn: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: Map<string, any> = new Map();
  private cacheExpiration: Map<string, number> = new Map();
  private cacheDuration: number = 300000; // Durée du cache en millisecondes (5 minutes)

  constructor() {}

  set(key: string, data: any): void {
    const now = Date.now();
    this.cache.set(key, data);
    this.cacheExpiration.set(key, now + this.cacheDuration);
  }

  get(key: string): any {
    const now = Date.now();
    if (this.cacheExpiration.has(key) && this.cacheExpiration.get(key)! > now) {
      return this.cache.get(key);
    } else {
      this.cache.delete(key);
      this.cacheExpiration.delete(key);
      return null;
    }
  }

  clear(key: string): void {
    this.cache.delete(key);
    this.cacheExpiration.delete(key);
  }

  clearAll(): void {
    this.cache.clear();
    this.cacheExpiration.clear();
  }

  createCacheKey(url: string, params: any): string {
    const paramString = JSON.stringify(params);
    return `${url}?${paramString}`;
  }
}

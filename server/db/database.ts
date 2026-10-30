/**
 * AgriTech Database Layer
 * Dual-engine: Supports Mongoose (MongoDB Atlas) and Local Persistent JSON Document Store
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import {
  INITIAL_USERS,
  INITIAL_FARMS,
  INITIAL_CROPS,
  INITIAL_SOIL_REPORTS,
  INITIAL_PRODUCTS,
  INITIAL_EXPERTS,
  INITIAL_CONSULTATIONS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_FARM_ACTIVITIES,
  INITIAL_PEST_REPORTS,
  INITIAL_ORDERS
} from './seedData.ts';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + file sync
class CollectionStore<T extends { _id: string }> {
  private filePath: string;
  private data: T[] = [];
  private name: string;

  constructor(name: string, initialData: T[] = []) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.load(initialData);
  }

  private load(initialData: T[]) {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = [...initialData];
        this.save();
      }
    } catch (err) {
      console.warn(`[Database] Error loading collection ${this.name}, using initial seed:`, err);
      this.data = [...initialData];
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[Database] Error persisting collection ${this.name}:`, err);
    }
  }

  find(filter: Partial<T> | ((item: T) => boolean) = {}): T[] {
    if (typeof filter === 'function') {
      return this.data.filter(filter);
    }
    return this.data.filter(item => {
      for (const key of Object.keys(filter) as Array<keyof T>) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(filter: Partial<T> | ((item: T) => boolean)): T | null {
    const results = this.find(filter);
    return results.length > 0 ? results[0] : null;
  }

  findById(id: string): T | null {
    return this.data.find(item => item._id === id) || null;
  }

  create(doc: Omit<T, '_id'> & { _id?: string }): T {
    const newDoc = {
      ...doc,
      _id: doc._id || `${this.name.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: (doc as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as T;

    this.data.unshift(newDoc);
    this.save();
    return newDoc;
  }

  findByIdAndUpdate(id: string, update: Partial<T>): T | null {
    const index = this.data.findIndex(item => item._id === id);
    if (index === -1) return null;

    this.data[index] = {
      ...this.data[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data[index];
  }

  findByIdAndDelete(id: string): boolean {
    const index = this.data.findIndex(item => item._id === id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    this.save();
    return true;
  }

  countDocuments(filter: Partial<T> | ((item: T) => boolean) = {}): number {
    return this.find(filter).length;
  }

  all(): T[] {
    return [...this.data];
  }

  resetWith(seed: T[]) {
    this.data = [...seed];
    this.save();
  }
}

// Initialize persistent collections
export const db = {
  users: new CollectionStore<any>('users', INITIAL_USERS),
  farms: new CollectionStore<any>('farms', INITIAL_FARMS),
  crops: new CollectionStore<any>('crops', INITIAL_CROPS),
  soilReports: new CollectionStore<any>('soilReports', INITIAL_SOIL_REPORTS),
  products: new CollectionStore<any>('products', INITIAL_PRODUCTS),
  experts: new CollectionStore<any>('experts', INITIAL_EXPERTS),
  consultations: new CollectionStore<any>('consultations', INITIAL_CONSULTATIONS),
  communityPosts: new CollectionStore<any>('communityPosts', INITIAL_COMMUNITY_POSTS),
  comments: new CollectionStore<any>('comments', [
    {
      _id: 'comm_001',
      postId: 'post_001',
      userId: 'usr_expert_001',
      authorName: 'Dr. Aris Thorne',
      authorRole: 'Agricultural Expert',
      content: 'Excellent initiative Ramesh! Morning irrigation minimizes leaf wetness duration, which significantly curbs spore germination for rusts and blights.',
      createdAt: '2026-10-22T09:40:00.000Z'
    }
  ]),
  notifications: new CollectionStore<any>('notifications', INITIAL_NOTIFICATIONS),
  farmActivities: new CollectionStore<any>('farmActivities', INITIAL_FARM_ACTIVITIES),
  pestReports: new CollectionStore<any>('pestReports', INITIAL_PEST_REPORTS),
  orders: new CollectionStore<any>('orders', INITIAL_ORDERS),
  carts: new CollectionStore<any>('carts', [
    {
      _id: 'cart_usr_farmer_001',
      userId: 'usr_farmer_001',
      items: [],
      updatedAt: new Date().toISOString()
    }
  ])
};

// Connect to MongoDB Atlas if URI is provided
export async function initializeDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoUri.includes('<username>')) {
    try {
      console.log('[Database] Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('[Database] Connected to MongoDB Atlas successfully.');
    } catch (err) {
      console.warn('[Database] MongoDB Atlas connection failed, using persistent local JSON database:', err);
    }
  } else {
    console.log('[Database] Using persistent local JSON database (MongoDB compatible).');
  }
}

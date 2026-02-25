import type { IWorkoutListStorage, StorageStats } from 'src/entities/workout-list/api/types';
import type { WorkoutList } from 'src/entities/workout-list/model/types';

const STORAGE_KEY = 'workout-lists';
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // 5MB fallback when navigator.storage.estimate is unavailable

class LocalStorageService implements IWorkoutListStorage {
  private getStorageData(): WorkoutList[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  private setStorageData(lists: WorkoutList[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      throw new Error('Failed to save workout list. Storage might be full.');
    }
  }

  private calculateLocalStorageSize(): number {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }
    return totalSize * 2;
  }

  getAllLists(): WorkoutList[] {
    return this.getStorageData();
  }

  getList(id: string): WorkoutList | null {
    const lists = this.getStorageData();
    return lists.find(list => list.id === id) || null;
  }

  saveList(list: WorkoutList): void {
    const lists = this.getStorageData();
    const existingIndex = lists.findIndex(l => l.id === list.id);
    if (existingIndex >= 0) {
      lists[existingIndex] = list;
    } else {
      lists.push(list);
    }
    this.setStorageData(lists);
  }

  deleteList(id: string): void {
    const lists = this.getStorageData();
    const filteredLists = lists.filter(list => list.id !== id);
    this.setStorageData(filteredLists);
  }

  updateList(id: string, updates: Partial<WorkoutList>): void {
    const lists = this.getStorageData();
    const list = lists.find(list => list.id === id);
    if (list) {
      Object.assign(list, updates);
      this.setStorageData(lists);
    }
  }

  getUsagePercentage(): number {
    const usedBytes = this.calculateLocalStorageSize();
    return (usedBytes / STORAGE_LIMIT_BYTES) * 100;
  }

  async getUsagePercentageAsync(): Promise<number> {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      try {
        const { usage, quota } = await navigator.storage.estimate();
        if (quota && quota > 0) {
          return ((usage ?? 0) / quota) * 100;
        }
      } catch {
        // Fall through to sync fallback
      }
    }
    return this.getUsagePercentage();
  }

  getStorageStats(): StorageStats {
    const usedBytes = this.calculateLocalStorageSize();
    const usagePercentage = (usedBytes / STORAGE_LIMIT_BYTES) * 100;
    return {
      usedBytes,
      totalBytes: STORAGE_LIMIT_BYTES,
      usagePercentage,
      isNearLimit: usagePercentage >= 80,
    };
  }
}

export const workoutListStorage = new LocalStorageService();

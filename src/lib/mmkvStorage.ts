import { StateStorage } from 'zustand/middleware';

const memoryStorage = new Map<string, string>();

export const mmkvZustandStorage: StateStorage = {
  getItem: name => memoryStorage.get(name) ?? null,
  setItem: (name, value) => {
    memoryStorage.set(name, value);
  },
  removeItem: name => {
    memoryStorage.delete(name);
  },
};

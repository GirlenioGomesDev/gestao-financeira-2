import { useEffect, useState } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from './database';

export function useDatabase() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getDatabase()
      .then(database => {
        setDb(database);
        setIsReady(true);
      })
      .catch(reason => {
        const initializationError =
          reason instanceof Error
            ? reason
            : new Error('Falha desconhecida ao inicializar o banco.');

        console.error('[Database] Falha ao inicializar:', initializationError);
        setError(initializationError);
      });
  }, []);

  return { db, isReady, error };
}

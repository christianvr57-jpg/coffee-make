// Hook para consultas reactivas a la base de datos: la vista se repinta sola
// cuando cambian los datos que lee.
import { liveQuery } from 'dexie';
import { useEffect, useState } from 'preact/hooks';

export function useVivo<T>(consulta: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [valor, setValor] = useState<T | undefined>(undefined);
  useEffect(() => {
    const sub = liveQuery(consulta).subscribe({
      next: (v) => setValor(() => v),
      error: (e) => console.error(e),
    });
    return () => sub.unsubscribe();
  }, deps);
  return valor;
}

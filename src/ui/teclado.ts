// Atajos de teclado para el ordenador.
import { useEffect } from 'preact/hooks';

const escribiendo = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/** Flechas ← → (p. ej. semana anterior / siguiente). No actúan con una hoja abierta ni escribiendo. */
export function useFlechas(izquierda: () => void, derecha: () => void, activo = true) {
  useEffect(() => {
    if (!activo) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || escribiendo(e.target) || document.documentElement.classList.contains('bloqueado')) return;
      if (e.key === 'ArrowLeft') izquierda();
      else if (e.key === 'ArrowRight') derecha();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [activo, izquierda, derecha]);
}

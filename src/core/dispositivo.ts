// Capacidades del dispositivo: mantener la pantalla encendida y avisos sonoros.

let bloqueo: WakeLockSentinel | null = null;
let quiereBloqueo = false;

/** Mantiene la pantalla encendida (en apps instaladas en iPhone funciona desde iOS 18.4). */
export async function mantenerPantalla(activo: boolean): Promise<void> {
  quiereBloqueo = activo;
  try {
    if (activo && 'wakeLock' in navigator && !bloqueo) {
      bloqueo = await navigator.wakeLock.request('screen');
      bloqueo.addEventListener('release', () => {
        bloqueo = null;
      });
    } else if (!activo && bloqueo) {
      await bloqueo.release();
      bloqueo = null;
    }
  } catch {
    /* no disponible o denegado */
  }
}
// iOS suelta el bloqueo al pasar a segundo plano: se vuelve a pedir al volver.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && quiereBloqueo) mantenerPantalla(true);
});

let ctx: AudioContext | null = null;

/** Debe llamarse desde un toque del usuario (iOS solo permite audio tras un gesto). */
export function prepararAudio(): void {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = 'transient';
    ctx = ctx || new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    ctx = null;
  }
}

/** Pitido corto. `agudo` para cambios de fase; normal para la cuenta atrás. */
export function pitido(agudo = false): void {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gan = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = agudo ? 1320 : 880;
  gan.gain.setValueAtTime(0.0001, t);
  gan.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
  gan.gain.exponentialRampToValueAtTime(0.0001, t + (agudo ? 0.35 : 0.12));
  osc.connect(gan).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.4);
}

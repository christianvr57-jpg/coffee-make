// Tarjeta de diagnóstico de extracción: lectura + sugerencias con su porqué.
import { useState } from 'preact/hooks';
import { useVivo } from '../../../core/vivo';
import { db } from '../../../core/db';
import { Icono } from '../../../ui/Icono';
import { diagnosticar, type Sugerencia } from '../diagnostico';
import type { Preparacion } from '../modelo';
import { obtenerReceta } from '../repositorio';

const ICONO: Record<Sugerencia['tipo'], string> = { ajuste: 'equipo', tecnica: 'v60', aviso: 'aviso', bien: 'check' };

function FilaSugerencia({ s, onProbar }: { s: Sugerencia; onProbar?: (c: Partial<Preparacion>) => void }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div class={`sugerencia ${s.tipo}`}>
      <div class="sg-cab">
        <span class="sg-icono">
          <Icono n={ICONO[s.tipo]} t={18} />
        </span>
        <div class="sg-txt">
          <b>{s.titulo}</b>
          <p>{s.accion}</p>
        </div>
      </div>
      <button type="button" class="sg-porque" aria-expanded={abierta} onClick={() => setAbierta(!abierta)}>
        ¿Por qué? <Icono n="chevronAbajo" t={14} clase="mini-chev" />
      </button>
      {abierta && <p class="sg-explicacion">{s.porque}</p>}
      {s.cambio && onProbar && (
        <button type="button" class="boton-secundario" onClick={() => onProbar(s.cambio!)}>
          <Icono n="repetir" t={18} /> Probar esto la próxima vez
        </button>
      )}
    </div>
  );
}

export function TarjetaDiagnostico({ prep, onProbar }: { prep: Partial<Preparacion> & Pick<Preparacion, 'metodo'>; onProbar?: (c: Partial<Preparacion>) => void }) {
  const cafe = useVivo(async () => (prep.cafeId ? db.cafe_cafes.get(prep.cafeId) : undefined), [prep.cafeId]);
  const molino = useVivo(async () => (prep.molinoId ? db.cafe_equipo.get(prep.molinoId) : undefined), [prep.molinoId]);
  const receta = useVivo(() => obtenerReceta(prep.recetaId), [prep.recetaId]);
  const d = diagnosticar(prep, { cafe, molino, objetivo: receta?.metodo === prep.metodo ? receta.tiempoObjetivo : undefined });
  return (
    <section class="diagnostico">
      <div class="dg-lectura">
        <Icono n="info" t={16} />
        <span>{d.lectura}</span>
      </div>
      {d.sugerencias.map((s) => (
        <FilaSugerencia key={s.id} s={s} onProbar={onProbar} />
      ))}
      {d.sugerencias.length > 1 && d.sugerencias.some((s) => s.cambio) && <p class="pie">Cambia una sola cosa cada vez: así sabrás qué ha funcionado.</p>}
    </section>
  );
}

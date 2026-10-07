// BUSCAR en todos los módulos a la vez.
import { useEffect, useState } from 'preact/hooks';
import type { ResultadoBusqueda } from '../core/modulos';
import { MODULOS } from '../core/registro';
import { ir } from '../core/router';
import { BarraDetalle } from '../ui/Cabecera';
import { Icono } from '../ui/Icono';

export function Buscar() {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<(ResultadoBusqueda & { modulo: string })[]>([]);
  useEffect(() => {
    let vigente = true;
    const t = q.trim();
    if (t.length < 2) {
      setRes([]);
      return;
    }
    Promise.all(MODULOS.filter((m) => m.buscar).map(async (m) => (await m.buscar!(t)).map((r) => ({ ...r, modulo: m.nombre })))).then((listas) => {
      if (vigente) setRes(listas.flat());
    });
    return () => {
      vigente = false;
    };
  }, [q]);
  return (
    <>
      <BarraDetalle padre="/" textoAtras="Inicio" titulo="Buscar" />
      <div class="pagina">
        <div class="buscador">
          <Icono n="buscar" t={18} />
          <input type="search" placeholder="Cafés, tareas, notas…" value={q} autoFocus onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
        </div>
        {q.trim().length >= 2 && !res.length && <p class="vacio">Sin resultados para «{q.trim()}».</p>}
        {res.length > 0 && (
          <div class="lista">
            {res.slice(0, 60).map((r) => (
              <button type="button" class="item" onClick={() => ir(r.ruta)}>
                <span class="insignia" style={{ '--tam': '34px' }}>
                  <Icono n={r.icono || 'buscar'} t={20} />
                </span>
                <div class="item-txt">
                  <div class="item-tit">{r.titulo}</div>
                  <div class="item-meta">{r.detalle || r.modulo}</div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

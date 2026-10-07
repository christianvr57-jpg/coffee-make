// Selector con buscador para listas largas (países, variedades, procesos), con opción de añadir valores nuevos.
import { useState } from 'preact/hooks';
import { Hoja, abrirHoja } from './capas';
import { Icono } from './Icono';

function Contenido(p: { titulo: string; opciones: string[]; valor: string[]; multiple: boolean; cerrar: () => void; elegir: (v: string[]) => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>(p.valor);
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const todas = [...new Set([...sel, ...p.opciones])];
  const filtradas = q ? todas.filter((o) => norm(o).includes(norm(q))) : todas;
  const existe = todas.some((o) => norm(o) === norm(q.trim()));
  const tocar = (o: string) => {
    if (!p.multiple) {
      p.elegir([o]);
      p.cerrar();
      return;
    }
    setSel(sel.includes(o) ? sel.filter((x) => x !== o) : [...sel, o]);
  };
  return (
    <Hoja titulo={p.titulo} cerrar={p.cerrar} guardar="Listo" onGuardar={p.multiple ? () => p.elegir(sel) : undefined}>
      <div class="buscador">
        <Icono n="buscar" t={18} />
        <input type="search" placeholder="Buscar o escribir uno nuevo" value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} autocomplete="off" />
      </div>
      <div class="lista">
        {q.trim() && !existe && (
          <button type="button" class="boton-fila" onClick={() => (tocar(q.trim()), setQ(''))}>
            <Icono n="anadir" t={20} /> Añadir «{q.trim()}»
          </button>
        )}
        {filtradas.map((o) => (
          <button type="button" class="opcion" aria-pressed={sel.includes(o)} onClick={() => tocar(o)}>
            <span>{o}</span>
            {sel.includes(o) && <Icono n="check" t={18} />}
          </button>
        ))}
      </div>
    </Hoja>
  );
}

export function abrirSelector(o: { titulo: string; opciones: string[]; valor: string[]; multiple?: boolean; elegir: (v: string[]) => void }) {
  abrirHoja((cerrar) => <Contenido {...o} multiple={!!o.multiple} cerrar={cerrar} />);
}

/** Fila de formulario que muestra lo elegido y abre el selector. */
export function CampoSelector(o: { et: string; titulo?: string; opciones: string[]; valor: string[]; multiple?: boolean; cambiar: (v: string[]) => void; marcador?: string }) {
  return (
    <button type="button" class="campo campo-boton" onClick={() => abrirSelector({ titulo: o.titulo || o.et, opciones: o.opciones, valor: o.valor, multiple: o.multiple, elegir: o.cambiar })}>
      <span class="et">{o.et}</span>
      <span class={`cb-valor${o.valor.length ? '' : ' vacio'}`}>{o.valor.length ? o.valor.join(', ') : o.marcador || 'Elegir'}</span>
      <Icono n="chevron" t={16} clase="chev" />
    </button>
  );
}

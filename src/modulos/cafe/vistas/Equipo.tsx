// CAFÉ · Equipo y aguas.
import { useState } from 'preact/hooks';
import { borrar, guardar } from '../../../core/db';
import { useVivo } from '../../../core/vivo';
import { Hoja, abrirHoja, confirmar, elegir } from '../../../ui/capas';
import { Campo, Interruptor, Lista, Numero, Segmentado, Selector, Texto } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import type { Agua, Equipo, TipoEquipo } from '../modelo';
import { listarAguas, listarEquipo } from '../repositorio';

const TIPOS: [TipoEquipo, string, string][] = [
  ['cafetera', 'Cafeteras', 'espresso'],
  ['molino', 'Molinos', 'molino'],
  ['bascula', 'Básculas', 'bascula'],
  ['hervidor', 'Hervidores', 'termometro'],
  ['dripper', 'Drippers y métodos', 'v60'],
  ['cesta', 'Cestas y portafiltros', 'equipo'],
  ['otro', 'Otros', 'equipo'],
];

export function EquipoVista() {
  const equipo = useVivo(listarEquipo, []) || [];
  const aguas = useVivo(listarAguas, []) || [];
  const nuevo = async () => {
    const r = await elegir('Añadir', ['Equipo', 'Tipo de agua']);
    if (r === 0) editarEquipo(null);
    if (r === 1) editarAgua(null);
  };
  return (
    <>
      <div class="sub-cabecera">
        <div class="sub">Los ajustes de molienda se guardan por molino: no son comparables entre sí.</div>
        <button type="button" class="btn-mas" aria-label="Añadir equipo" onClick={nuevo}>
          <Icono n="anadir" t={24} />
        </button>
      </div>
      {TIPOS.map(([tipo, titulo, icono]) => {
        const items = equipo.filter((e) => e.tipo === tipo);
        if (!items.length) return null;
        return (
          <Lista titulo={titulo}>
            {items.map((e) => (
              <button type="button" class={`item${e.activo ? '' : ' inactiva'}`} onClick={() => editarEquipo(e)}>
                <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
                  <Icono n={icono} t={21} />
                </span>
                <div class="item-txt">
                  <div class="item-tit">{e.nombre}</div>
                  <div class="item-meta">
                    {e.molino ? `${e.molino.manual ? 'Manual' : 'Eléctrico'} · escala en ${e.molino.escala === 'clics' ? 'clics' : 'números'} (${e.molino.min}-${e.molino.max})` : e.notas || [e.marca, e.modelo].filter(Boolean).join(' ')}
                  </div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </button>
            ))}
          </Lista>
        );
      })}
      <Lista titulo="Agua" pie="El agua es casi todo el café: anotar cuál usas ayuda a entender por qué un día sabe distinto.">
        {aguas.map((a) => (
          <button type="button" class="item" onClick={() => editarAgua(a)}>
            <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
              <Icono n="gota" t={21} />
            </span>
            <div class="item-txt">
              <div class="item-tit">{a.nombre}</div>
              <div class="item-meta">{[a.residuoSeco ? `Residuo seco ${a.residuoSeco} mg/L` : '', a.gh ? `GH ${a.gh}` : '', a.kh ? `KH ${a.kh}` : '', a.notas].filter(Boolean).join(' · ')}</div>
            </div>
            <Icono n="chevron" t={16} clase="chev" />
          </button>
        ))}
      </Lista>
    </>
  );
}

function EditorEquipo({ original, cerrar }: { original: Equipo | null; cerrar: () => void }) {
  const [f, setF] = useState<Partial<Equipo>>(() => original || { tipo: 'molino', nombre: '', activo: true, molino: { escala: 'clics', min: 0, max: 40, paso: 1, manual: true } });
  const [error, setError] = useState(false);
  const set = (p: Partial<Equipo>) => setF((x) => ({ ...x, ...p }));
  const mol = f.molino || { escala: 'clics' as const, min: 0, max: 40, paso: 1, manual: true };
  const setMol = (p: Partial<typeof mol>) => set({ molino: { ...mol, ...p } });
  const guardarEq = async () => {
    if (!f.nombre?.trim()) return setError(true), false;
    await guardar<Equipo>('cafe_equipo', { ...f, nombre: f.nombre.trim(), molino: f.tipo === 'molino' ? mol : undefined });
  };
  const eliminar = async () => {
    if (await confirmar({ titulo: `¿Eliminar ${original?.nombre}?`, texto: 'Las preparaciones que lo usaron se conservan.', ok: 'Eliminar', peligro: true })) {
      await borrar('cafe_equipo', original!.id);
      cerrar();
    }
  };
  return (
    <Hoja titulo={original ? 'Editar equipo' : 'Nuevo equipo'} cerrar={cerrar} guardar={original ? 'Guardar' : 'Añadir'} onGuardar={guardarEq}>
      <Lista>
        <Campo et="Nombre" col clase={error ? 'error' : ''}>
          <Texto valor={f.nombre || ''} cambiar={(v) => set({ nombre: v })} marcador="Por ejemplo: Timemore C3" />
        </Campo>
        <Campo et="Tipo">
          <Selector opciones={TIPOS.map(([v, n]) => [v, n] as [TipoEquipo, string])} valor={f.tipo || 'otro'} cambiar={(v) => set({ tipo: v })} />
        </Campo>
        <Campo et="En uso">
          <Interruptor valor={f.activo !== false} cambiar={(v) => set({ activo: v })} />
        </Campo>
      </Lista>
      {f.tipo === 'molino' && (
        <Lista titulo="Escala del molino" pie="Así sabrá la app cómo mostrar y ajustar la molienda de este molino.">
          <Campo et="Tipo de escala" col>
            <Segmentado<'clics' | 'numero'> opciones={[['clics', 'Clics'], ['numero', 'Números del dial']]} valor={mol.escala} cambiar={(v) => setMol({ escala: v })} />
          </Campo>
          <Campo et="Mínimo">
            <Numero valor={mol.min} cambiar={(v) => setMol({ min: v ?? 0 })} dec={1} />
          </Campo>
          <Campo et="Máximo">
            <Numero valor={mol.max} cambiar={(v) => setMol({ max: v ?? 40 })} dec={1} />
          </Campo>
          <Campo et="Paso">
            <Numero valor={mol.paso} cambiar={(v) => setMol({ paso: v || 1 })} dec={2} />
          </Campo>
          <Campo et="Micras por paso" sub="Si el fabricante lo indica">
            <Numero valor={mol.micrasPorPaso} cambiar={(v) => setMol({ micrasPorPaso: v })} unidad="µm" dec={0} />
          </Campo>
          <Campo et="Manual">
            <Interruptor valor={mol.manual} cambiar={(v) => setMol({ manual: v })} />
          </Campo>
        </Lista>
      )}
      <Lista titulo="Notas">
        <Campo col>
          <Texto multilinea valor={f.notas || ''} cambiar={(v) => set({ notas: v })} marcador="Características, ajustes, mantenimiento…" />
        </Campo>
      </Lista>
      {original && (
        <div class="lista separada">
          <button type="button" class="boton-fila peligro" onClick={eliminar}>
            <Icono n="papelera" t={22} /> Eliminar
          </button>
        </div>
      )}
    </Hoja>
  );
}

function EditorAgua({ original, cerrar }: { original: Agua | null; cerrar: () => void }) {
  const [f, setF] = useState<Partial<Agua>>(() => original || { nombre: '', tipo: 'embotellada' });
  const [error, setError] = useState(false);
  const set = (p: Partial<Agua>) => setF((x) => ({ ...x, ...p }));
  const guardarAgua = async () => {
    if (!f.nombre?.trim()) return setError(true), false;
    await guardar<Agua>('cafe_aguas', { ...f, nombre: f.nombre.trim() });
  };
  const eliminar = async () => {
    if (await confirmar({ titulo: `¿Eliminar ${original?.nombre}?`, ok: 'Eliminar', peligro: true })) {
      await borrar('cafe_aguas', original!.id);
      cerrar();
    }
  };
  return (
    <Hoja titulo={original ? 'Editar agua' : 'Nuevo tipo de agua'} cerrar={cerrar} guardar={original ? 'Guardar' : 'Añadir'} onGuardar={guardarAgua}>
      <Lista>
        <Campo et="Nombre" col clase={error ? 'error' : ''}>
          <Texto valor={f.nombre || ''} cambiar={(v) => set({ nombre: v })} marcador="Marca o descripción" />
        </Campo>
        <Campo et="Tipo">
          <Selector<Agua['tipo']> opciones={[['filtrada', 'Filtrada'], ['embotellada', 'Embotellada'], ['grifo', 'Del grifo'], ['receta', 'Receta de minerales']]} valor={f.tipo || 'embotellada'} cambiar={(v) => set({ tipo: v })} />
        </Campo>
      </Lista>
      <Lista titulo="Composición (opcional)" pie="El residuo seco viene en la etiqueta de las botellas. Para filtro se suele recomendar agua blanda, pero no destilada: sin minerales, el café sale plano.">
        <Campo et="Residuo seco" sub="mg/L a 180 °C">
          <Numero valor={f.residuoSeco} cambiar={(v) => set({ residuoSeco: v })} dec={0} />
        </Campo>
        <Campo et="Dureza (GH)" sub="ppm como CaCO₃">
          <Numero valor={f.gh} cambiar={(v) => set({ gh: v })} dec={0} />
        </Campo>
        <Campo et="Alcalinidad (KH)" sub="ppm como CaCO₃">
          <Numero valor={f.kh} cambiar={(v) => set({ kh: v })} dec={0} />
        </Campo>
      </Lista>
      <Lista titulo="Notas">
        <Campo col>
          <Texto multilinea valor={f.notas || ''} cambiar={(v) => set({ notas: v })} />
        </Campo>
      </Lista>
      {original && (
        <div class="lista separada">
          <button type="button" class="boton-fila peligro" onClick={eliminar}>
            <Icono n="papelera" t={22} /> Eliminar
          </button>
        </div>
      )}
    </Hoja>
  );
}

const editarEquipo = (e: Equipo | null) => abrirHoja((cerrar) => <EditorEquipo original={e} cerrar={cerrar} />);
const editarAgua = (a: Agua | null) => abrirHoja((cerrar) => <EditorAgua original={a} cerrar={cerrar} />);

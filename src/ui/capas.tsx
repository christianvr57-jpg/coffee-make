// Capas flotantes compartidas: aviso con "Deshacer", diálogos tipo alerta de iOS y hojas inferiores.
import { signal } from '@preact/signals';
import type { ComponentChildren, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';

// ---------- Aviso (toast) -------------------------------------------------------------------------
interface EstadoToast {
  id: number;
  texto: string;
  accion?: string;
  alAccion?: () => void;
}
const toast = signal<EstadoToast | null>(null);
let temporizador: ReturnType<typeof setTimeout> | undefined;

export function mostrarToast(texto: string, accion?: string, alAccion?: () => void): void {
  clearTimeout(temporizador);
  toast.value = { id: Date.now(), texto, accion, alAccion };
  temporizador = setTimeout(ocultarToast, 4500);
}
export function ocultarToast(): void {
  clearTimeout(temporizador);
  toast.value = null;
}

function Toast() {
  const t = toast.value;
  return (
    <div id="toast" class={t ? 'visible' : ''} role="status" aria-live="polite">
      {t && (
        <>
          <span class="toast-txt">{t.texto}</span>
          {t.accion && (
            <button type="button" class="toast-btn" onClick={() => { ocultarToast(); t.alAccion?.(); }}>
              {t.accion}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ---------- Diálogos -------------------------------------------------------------------------------
interface BotonDialogo {
  texto: string;
  valor: number;
  estilo?: 'principal' | 'peligro';
}
interface EstadoDialogo {
  titulo: string;
  texto?: string;
  botones: BotonDialogo[];
  cancelable: boolean;
  resolver: (v: number) => void;
}
const dialogo = signal<EstadoDialogo | null>(null);

function abrirDialogo(d: Omit<EstadoDialogo, 'resolver'>): Promise<number> {
  return new Promise((resolver) => {
    dialogo.value = { ...d, resolver };
  });
}

export async function confirmar(o: { titulo: string; texto?: string; ok?: string; peligro?: boolean; cancelar?: string | false }): Promise<boolean> {
  const botones: BotonDialogo[] = [];
  if (o.cancelar !== false) botones.push({ texto: o.cancelar || 'Cancelar', valor: 0 });
  botones.push({ texto: o.ok || 'Aceptar', valor: 1, estilo: o.peligro ? 'peligro' : 'principal' });
  return (await abrirDialogo({ titulo: o.titulo, texto: o.texto, botones, cancelable: o.cancelar !== false })) === 1;
}

export const avisar = (titulo: string, texto?: string) => confirmar({ titulo, texto, ok: 'Entendido', cancelar: false });

/** Hoja de acciones: devuelve el índice elegido o -1. */
export function elegir(titulo: string, opciones: string[]): Promise<number> {
  return abrirDialogo({
    titulo,
    botones: [...opciones.map((texto, valor) => ({ texto, valor, estilo: 'principal' as const })), { texto: 'Cancelar', valor: -1 }],
    cancelable: true,
  });
}

function Dialogo() {
  const d = dialogo.value;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (d) requestAnimationFrame(() => setVisible(true));
  }, [d]);
  if (!d) return null;
  const cerrar = (v: number) => {
    setVisible(false);
    setTimeout(() => {
      dialogo.value = null;
      d.resolver(v);
    }, 180);
  };
  return (
    <div class={`dialogo-fondo${visible ? ' visible' : ''}`} onClick={(e) => e.target === e.currentTarget && d.cancelable && cerrar(d.botones.find((b) => b.valor <= 0)?.valor ?? 0)}>
      <div class="dialogo" role="alertdialog" aria-modal="true">
        <div class="dialogo-txt">
          <h3>{d.titulo}</h3>
          {d.texto && <p>{d.texto}</p>}
        </div>
        <div class="dialogo-botones">
          {d.botones.map((b) => (
            <button type="button" class={b.estilo || ''} onClick={() => cerrar(b.valor)}>
              {b.texto}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Hojas inferiores ------------------------------------------------------------------------
interface ItemHoja {
  id: number;
  render: (cerrar: () => void) => VNode;
  cerrando: boolean;
}
const pila = signal<ItemHoja[]>([]);
let contador = 0;

export function abrirHoja(render: (cerrar: () => void) => VNode): () => void {
  const id = ++contador;
  pila.value = [...pila.value, { id, render, cerrando: false }];
  document.documentElement.classList.add('bloqueado');
  return () => cerrarHoja(id);
}

function cerrarHoja(id: number): void {
  pila.value = pila.value.map((h) => (h.id === id ? { ...h, cerrando: true } : h));
  setTimeout(() => {
    pila.value = pila.value.filter((h) => h.id !== id);
    if (!pila.value.length) document.documentElement.classList.remove('bloqueado');
  }, 300);
}

function MarcoHoja({ item }: { item: ItemHoja }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);
  const cerrar = () => cerrarHoja(item.id);
  return (
    <div class={`hoja-fondo${visible && !item.cerrando ? ' visible' : ''}`} onClick={(e) => e.target === e.currentTarget && cerrar()}>
      <div class="hoja" role="dialog" aria-modal="true">
        <div class="hoja-asa" />
        {item.render(cerrar)}
      </div>
    </div>
  );
}

/** Estructura estándar de una hoja: Cancelar | título | Guardar. */
export function Hoja(props: {
  titulo: string;
  cerrar: () => void;
  guardar?: string;
  onGuardar?: () => boolean | void | Promise<boolean | void>;
  children: ComponentChildren;
}) {
  const guardar = async () => {
    const r = props.onGuardar ? await props.onGuardar() : true;
    if (r !== false) props.cerrar();
  };
  return (
    <>
      <header class="hoja-cab">
        <button type="button" class="hoja-btn" onClick={props.cerrar}>Cancelar</button>
        <h2>{props.titulo}</h2>
        {props.onGuardar ? (
          <button type="button" class="hoja-btn fuerte" onClick={guardar}>{props.guardar || 'Guardar'}</button>
        ) : (
          <span class="hoja-btn" />
        )}
      </header>
      <div class="hoja-cuerpo">{props.children}</div>
    </>
  );
}

export function Capas() {
  return (
    <>
      {pila.value.map((h) => <MarcoHoja key={h.id} item={h} />)}
      <Dialogo />
      <Toast />
    </>
  );
}

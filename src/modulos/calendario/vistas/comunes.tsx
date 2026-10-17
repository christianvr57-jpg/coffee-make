// Piezas del Calendario: la etiqueta del turno y la hoja de un día (turno y notas).
import { useState } from 'preact/hooks';
import { DIAS, MESES, parse } from '../../../core/fechas';
import { useVivo } from '../../../core/vivo';
import { Hoja, abrirHoja, confirmar, mostrarToast } from '../../../ui/capas';
import { Icono } from '../../../ui/Icono';
import { alternarHecha, borrarNota, guardarNota, leerNotas, leerTurnos, nombreTurnos, ponerTurno } from '../estado';
import { TIPOS_NOTA, TURNOS, nombreTurno, tipoNota, type NotaDia, type TipoNota, type Turno } from '../tipos';

export const fechaLarga = (f: string) => {
  const d = parse(f);
  return `${DIAS[d.getDay() || 7]} ${d.getDate()} de ${MESES[d.getMonth() + 1]}`;
};

/** Letra del turno con su color (L, M, T, N). */
export function ChipTurno({ t, grande = false }: { t: Turno; grande?: boolean }) {
  return (
    <span class={`turno-chip t-${t}${grande ? ' grande' : ''}`} title={nombreTurno(t)}>
      {t}
    </span>
  );
}

/** Icono del tipo de nota. */
export function IconoNota({ tipo, t = 16 }: { tipo: TipoNota; t?: number }) {
  return (
    <span class={`nota-ico n-${tipo}`}>
      <Icono n={tipoNota(tipo).icono} t={t} />
    </span>
  );
}

function FilaNota({ n, editar }: { n: NotaDia; editar: (n: NotaDia) => void }) {
  return (
    <div class={`nota-fila${n.hecha ? ' hecha' : ''}`}>
      <button type="button" class={`casilla${n.hecha ? ' marcada' : ''}`} aria-label={n.hecha ? 'Desmarcar' : 'Marcar como hecha'} onClick={() => alternarHecha(n)}>
        {n.hecha && <Icono n="check" t={16} />}
      </button>
      <IconoNota tipo={n.tipo} />
      <button type="button" class="nota-texto" onClick={() => editar(n)}>
        <span>{n.texto}</span>
        <small>{tipoNota(n.tipo).nombre}</small>
      </button>
      <button
        type="button"
        class="nota-quitar"
        aria-label="Borrar nota"
        onClick={async () => {
          if (await confirmar({ titulo: '¿Borrar esta nota?', texto: n.texto, ok: 'Borrar', peligro: true })) {
            await borrarNota(n.id);
            mostrarToast('Nota borrada');
          }
        }}
      >
        <Icono n="papelera" t={18} />
      </button>
    </div>
  );
}

function HojaDia({ fecha, cerrar }: { fecha: string; cerrar: () => void }) {
  const turnos = useVivo(() => leerTurnos(fecha, fecha), [fecha]);
  const notas = useVivo(() => leerNotas(fecha, fecha), [fecha]) || [];
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState<TipoNota>('recordar');
  const [editando, setEditando] = useState<string | null>(null);
  const turno = turnos?.get(fecha) || null;

  const enviar = async (e?: Event) => {
    e?.preventDefault();
    if (!texto.trim()) return;
    await guardarNota({ id: editando || undefined, fecha, texto, tipo });
    mostrarToast(editando ? 'Nota cambiada' : 'Nota añadida');
    setTexto('');
    setEditando(null);
  };
  const editar = (n: NotaDia) => {
    setEditando(n.id);
    setTexto(n.texto);
    setTipo(n.tipo);
  };

  return (
    <Hoja titulo={fechaLarga(fecha)} cerrar={cerrar} textoCerrar="Cerrar">
      <div class="tit-lista">Turno de {nombreTurnos()}</div>
      <div class="turnos-sel">
        {TURNOS.map((x) => (
          <button type="button" class={`t-${x.id}`} aria-pressed={turno === x.id} onClick={() => ponerTurno(fecha, turno === x.id ? null : x.id)}>
            <b>{x.id}</b>
            <span>{x.nombre}</span>
          </button>
        ))}
        <button type="button" class="sin" aria-pressed={!turno} onClick={() => ponerTurno(fecha, null)}>
          <b>—</b>
          <span>Sin turno</span>
        </button>
      </div>

      <div class="tit-lista">Notas y recordatorios</div>
      {notas.length > 0 && (
        <div class="lista notas-dia">
          {notas.map((n) => (
            <FilaNota n={n} editar={editar} />
          ))}
        </div>
      )}
      <form class="lista nueva-nota" onSubmit={enviar}>
        <div class="chips compactos">
          {TIPOS_NOTA.map((t) => (
            <button type="button" class={`chip n-${t.id}`} aria-pressed={tipo === t.id} onClick={() => setTipo(t.id)}>
              <Icono n={t.icono} t={15} /> {t.nombre}
            </button>
          ))}
        </div>
        <div class="nn-fila">
          <input
            type="text"
            value={texto}
            placeholder={tipo === 'cita' ? 'Dentista, pediatra, revisión…' : tipo === 'plan' ? 'Cena con amigos, excursión…' : 'Lo que haya que recordar'}
            onInput={(e) => setTexto((e.target as HTMLInputElement).value)}
          />
          <button type="submit" class="boton-principal auto" disabled={!texto.trim()}>
            {editando ? 'Guardar' : 'Añadir'}
          </button>
        </div>
        {editando && (
          <button
            type="button"
            class="enlace-boton"
            onClick={() => {
              setEditando(null);
              setTexto('');
            }}
          >
            Cancelar la edición
          </button>
        )}
      </form>
      <p class="pie">Sin horas: solo lo que hay que tener en cuenta ese día. Toca una nota para cambiarla y el círculo para tacharla.</p>
    </Hoja>
  );
}

export const abrirDia = (fecha: string) => abrirHoja((cerrar) => <HojaDia fecha={fecha} cerrar={cerrar} />);

// COCINA · Lista de la compra: lo que pide el menú de la semana (con los cambios), agrupado por
// categorías, para ir marcando en el súper. Se pueden añadir cosas a mano y compartir la lista.
import { signal } from '@preact/signals';
import { useState } from 'preact/hooks';
import { addDays, fechaCorta, iso, isoWeekday, lunesDe, parse } from '../../../core/fechas';
import { diaActual } from '../../../core/hoy';
import { consulta } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { confirmar, mostrarToast } from '../../../ui/capas';
import { Interruptor, Segmentado } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { ajustesCocina, anadirArticulo, desmarcarTodo, leerCompra, marcarArticulo, quitarArticulo } from '../estado';
import { listaCompra, planSemana } from '../plan';
import { CATEGORIAS, type Categoria } from '../tipos';
import { useCambios } from './comunes';

/** 0 = esta semana, 1 = la próxima. Por defecto, el fin de semana se compra para la siguiente. */
const cual = signal<0 | 1 | null>(null);
const ocultarHecho = signal(false);

export function CompraCocina() {
  const hoy = parse(diaActual.value);
  const lunesQ = consulta().get('lunes');
  const elegida = cual.value ?? (isoWeekday(hoy) >= 6 ? 1 : 0);
  const lunes = lunesQ ? parse(lunesQ) : addDays(lunesDe(hoy), 7 * elegida);
  const clave = iso(lunes);
  const cambios = useCambios();
  const estado = useVivo(() => leerCompra(clave), [clave]);
  const [nuevo, setNuevo] = useState('');
  if (!cambios || !estado) return null;

  const dias = planSemana(lunes, ajustesCocina.value.inicio, cambios);
  const delMenu = listaCompra(dias);
  const marcado = new Map(estado.map((a) => [a.nombre, a]));
  const manuales = estado.filter((a) => a.manual);
  const todos = [...delMenu.map((a) => ({ ...a, manual: false })), ...manuales.filter((m) => !delMenu.some((a) => a.nombre === m.nombre)).map((m) => ({ nombre: m.nombre, c: m.c, usos: [] as string[], manual: true }))];
  const hechos = todos.filter((a) => marcado.get(a.nombre)?.hecho).length;

  const alternar = (nombre: string, c: Categoria, manual: boolean) => marcarArticulo(clave, nombre, c, !marcado.get(nombre)?.hecho, manual);
  const anadir = async (e: Event) => {
    e.preventDefault();
    if (!nuevo.trim()) return;
    await anadirArticulo(clave, nuevo);
    setNuevo('');
  };
  const compartir = async () => {
    const pendientes = todos.filter((a) => !marcado.get(a.nombre)?.hecho);
    const texto = [
      `Compra · semana del ${fechaCorta(lunes)}`,
      ...CATEGORIAS.flatMap(([c, n]) => {
        const xs = pendientes.filter((a) => a.c === c);
        return xs.length ? ['', n.toUpperCase(), ...xs.map((a) => `- ${a.nombre}`)] : [];
      }),
    ].join('\n');
    try {
      if (navigator.share) await navigator.share({ text: texto });
      else {
        await navigator.clipboard.writeText(texto);
        mostrarToast('Lista copiada');
      }
    } catch {
      /* compartir cancelado */
    }
  };
  const reiniciar = async () => {
    if (await confirmar({ titulo: '¿Desmarcar todo?', texto: 'Los artículos vuelven a estar pendientes.', ok: 'Desmarcar' })) await desmarcarTodo(clave);
  };

  return (
    <>
      {!lunesQ && (
        <div class="sub-cabecera">
          <Segmentado<0 | 1> opciones={[[0, 'Esta semana'], [1, 'La próxima']]} valor={elegida as 0 | 1} cambiar={(v) => (cual.value = v)} />
          <button type="button" class="btn-mas" aria-label="Compartir lista" onClick={compartir}>
            <Icono n="subir" t={22} />
          </button>
        </div>
      )}
      <div class="progreso-compra">
        <b>
          {hechos} de {todos.length}
        </b>
        <span>
          Semana del {fechaCorta(lunes)} al {fechaCorta(addDays(lunes, 6))} · menú {dias[0].semana + 1} de 4
        </span>
        <div class="barra-stock">
          <div style={{ width: `${todos.length ? (hechos / todos.length) * 100 : 0}%` }} />
        </div>
      </div>

      <form class="anadir-compra" onSubmit={anadir}>
        <input type="text" value={nuevo} placeholder="Añadir algo más (papel de horno, café…)" onInput={(e) => setNuevo((e.target as HTMLInputElement).value)} />
        <button type="submit" class="btn-icono" aria-label="Añadir">
          <Icono n="anadir" t={20} />
        </button>
      </form>

      {CATEGORIAS.map(([c, nombre]) => {
        const xs = todos.filter((a) => a.c === c && !(ocultarHecho.value && marcado.get(a.nombre)?.hecho));
        if (!xs.length) return null;
        return (
          <>
            <div class="tit-lista">{nombre}</div>
            <div class="lista">
              {xs.map((a) => {
                const hecho = !!marcado.get(a.nombre)?.hecho;
                return (
                  <div class={`articulo${hecho ? ' hecho' : ''}`}>
                    <button type="button" class="art-toque" aria-pressed={hecho} onClick={() => alternar(a.nombre, a.c, a.manual)}>
                      <span class={`casilla${hecho ? ' marcada' : ''}`}>{hecho && <Icono n="check" t={16} />}</span>
                      <span class="art-txt">
                        <b>{a.nombre}</b>
                        {a.usos.length > 0 && <small>{a.usos.length > 4 ? `${a.usos.length} veces esta semana` : a.usos.join(' · ')}</small>}
                        {a.manual && <small>Añadido a mano</small>}
                      </span>
                    </button>
                    {a.manual && (
                      <button type="button" class="art-quitar" aria-label={`Quitar ${a.nombre}`} onClick={() => quitarArticulo(clave, a.nombre)}>
                        <Icono n="cerrar" t={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        );
      })}

      <div class="lista separada">
        <div class="campo">
          <span class="et">Ocultar lo ya comprado</span>
          <Interruptor valor={ocultarHecho.value} cambiar={(v) => (ocultarHecho.value = v)} />
        </div>
        <button type="button" class="boton-fila" onClick={compartir}>
          <Icono n="subir" t={22} /> Compartir lo que falta
        </button>
        <button type="button" class="boton-fila" onClick={reiniciar}>
          <Icono n="reiniciar" t={22} /> Desmarcar todo
        </button>
      </div>
      <p class="pie">Sin cantidades: compra para vuestras raciones. Debajo de cada artículo verás para qué día es. Los básicos (fruta, leche del niño, frutos secos, aceite) se añaden cada semana.</p>
    </>
  );
}

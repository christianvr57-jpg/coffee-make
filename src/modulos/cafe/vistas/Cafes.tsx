// CAFÉ · Biblioteca de cafés: listado, ficha y editor.
import { signal } from '@preact/signals';
import { useState } from 'preact/hooks';
import { borrar, db, guardar } from '../../../core/db';
import { comprimirImagen } from '../../../core/archivos';
import { fechaCorta, hoyISO, parse } from '../../../core/fechas';
import { ulid } from '../../../core/ids';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { BarraDetalle } from '../../../ui/Cabecera';
import { Hoja, abrirHoja, confirmar, mostrarToast } from '../../../ui/capas';
import { Ajuste, Campo, Lista, Numero, Segmentado, Texto, fmt } from '../../../ui/form';
import { Icono } from '../../../ui/Icono';
import { CampoSelector } from '../../../ui/SelectorLista';
import { congelado, diasReposo, stock, ratio, textoRatio } from '../calculos';
import { PAISES, PROCESOS, TUESTES, USOS, VARIEDADES } from '../datos/catalogos';
import { metodo } from '../datos/metodos';
import type { Cafe, NivelTueste, UsoCafe } from '../modelo';
import { listarCafes, listarEquipo, listarPreparaciones } from '../repositorio';
import { BarraReposo, ChipReposo, IconoMetodo, Nota, descripcionCafe, textoMolienda, useFoto } from './comunes';
import { nuevaPreparacion } from './Preparar';
import { fichaProceso, fichaVariedad } from '../datos/guia';

const filtro = signal<'activos' | 'terminados'>('activos');

function Miniatura({ cafe, tam = 52 }: { cafe: Cafe; tam?: number }) {
  const url = useFoto(cafe.fotoId);
  return url ? (
    <img class="miniatura" src={url} alt="" style={{ width: `${tam}px`, height: `${tam}px` }} />
  ) : (
    <span class="insignia insignia-cafe" style={{ '--tam': `${tam}px` }}>
      <Icono n="grano" t={Math.round(tam * 0.55)} />
    </span>
  );
}

export function Cafes() {
  const cafes = useVivo(listarCafes, []);
  const preps = useVivo(listarPreparaciones, []) || [];
  const lista = (cafes || []).filter((c) => (filtro.value === 'activos' ? !c.terminado : c.terminado));
  return (
    <>
      <div class="sub-cabecera">
        <Segmentado<'activos' | 'terminados'> opciones={[['activos', 'En casa'], ['terminados', 'Terminados']]} valor={filtro.value} cambiar={(v) => (filtro.value = v)} />
        <button type="button" class="btn-mas" aria-label="Añadir café" onClick={() => editarCafe(null)}>
          <Icono n="anadir" t={24} />
        </button>
      </div>
      {cafes && lista.length === 0 && (
        <div class="vacio">
          <Icono n="grano" t={44} />
          <p>{filtro.value === 'activos' ? 'No tienes cafés en casa. Añade el primero con el botón +.' : 'Aún no has terminado ningún café.'}</p>
        </div>
      )}
      <div class="lista">
        {lista.map((c) => {
          const st = stock(c, preps);
          const usoPrincipal = c.uso === 'espresso' ? 'espresso' : 'filtro';
          const n = preps.filter((p) => p.cafeId === c.id).length;
          return (
            <a class="item item-cafe" href={`#/cafe/cafes/${c.id}`}>
              <Miniatura cafe={c} />
              <div class="item-txt">
                <div class="item-tit">{c.nombre}</div>
                <div class="item-meta">
                  {c.tostador}
                  {descripcionCafe(c) ? ` · ${descripcionCafe(c)}` : ''}
                </div>
                <div class="item-chips">
                  {!c.terminado && <ChipReposo cafe={c} uso={usoPrincipal} />}
                  {st.restante !== undefined && !c.terminado && <span class="chip-estado">≈ {fmt(st.restante, 0)} g</span>}
                  {n > 0 && <span class="chip-estado">{n} prep.</span>}
                </div>
              </div>
              <Icono n="chevron" t={16} clase="chev" />
            </a>
          );
        })}
      </div>
    </>
  );
}

export function FichaCafe({ params }: { params: Record<string, string> }) {
  const c = useVivo(() => db.cafe_cafes.get(params.id).then((x) => x ?? null), [params.id]);
  const preps = useVivo(async () => (await listarPreparaciones()).filter((p) => p.cafeId === params.id), [params.id]) || [];
  const equipo = useVivo(listarEquipo, []) || [];
  const foto = useFoto(c?.fotoId);
  if (c === undefined) return <BarraDetalle padre="/cafe/cafes" textoAtras="Cafés" />;
  if (!c || c.borrado) {
    return (
      <>
        <BarraDetalle padre="/cafe/cafes" textoAtras="Cafés" />
        <div class="vacio">Este café ya no existe.</div>
      </>
    );
  }
  const st = stock(c, preps);
  const ultimaDosis = preps[0]?.dosis;
  const precioKg = c.precio && c.pesoG ? (c.precio / c.pesoG) * 1000 : undefined;
  const estaCongelado = congelado(c);
  const fichas = [
    ...[...new Set(c.variedades.map(fichaVariedad).filter(Boolean))].map((v) => ({ nombre: v!.nombre, tipo: 'Variedad', ruta: `/cafe/guia/variedades/${v!.id}` })),
    ...[...new Set(c.procesos.map(fichaProceso).filter(Boolean))].map((x) => ({ nombre: x!.nombre, tipo: 'Proceso', ruta: `/cafe/guia/procesos/${x!.id}` })),
  ];
  // Mejor preparación por método.
  const mejores = Object.values(
    preps.reduce<Record<string, (typeof preps)[number]>>((acc, p) => {
      if (p.puntuacion === undefined) return acc;
      if (!acc[p.metodo] || (acc[p.metodo].puntuacion || 0) < p.puntuacion) acc[p.metodo] = p;
      return acc;
    }, {}),
  );
  const datos: [string, string | undefined][] = [
    ['Origen', [c.pais, c.region].filter(Boolean).join(', ') || undefined],
    ['Productor', c.productor],
    ['Altitud', c.altitudMin ? `${c.altitudMin}${c.altitudMax && c.altitudMax !== c.altitudMin ? `-${c.altitudMax}` : ''} m` : undefined],
    ['Variedad', c.variedades.join(', ') || undefined],
    ['Proceso', c.procesos.join(', ') || undefined],
    ['Tueste', TUESTES.find(([v]) => v === c.tueste)?.[1]],
    ['Pensado para', USOS.find(([v]) => v === c.uso)?.[1]],
    ['Tostado el', c.fechaTueste ? fechaCorta(parse(c.fechaTueste)) : undefined],
    ['Abierto el', c.fechaApertura ? fechaCorta(parse(c.fechaApertura)) : undefined],
    ['Precio', c.precio ? `${fmt(c.precio, 2)} €${precioKg ? ` (${fmt(precioKg, 0)} €/kg)` : ''}` : undefined],
  ];

  const alternarCongelado = async () => {
    const congelaciones = [...(c.congelaciones || [])];
    if (estaCongelado) congelaciones[congelaciones.length - 1] = { ...congelaciones[congelaciones.length - 1], hasta: hoyISO() };
    else congelaciones.push({ desde: hoyISO() });
    await guardar<Cafe>('cafe_cafes', { ...c, congelaciones });
    mostrarToast(estaCongelado ? 'Descongelado: el reposo vuelve a contar' : 'Congelado: el reposo deja de contar');
  };
  const alternarTerminado = async () => {
    await guardar<Cafe>('cafe_cafes', { ...c, terminado: !c.terminado });
    mostrarToast(c.terminado ? 'Café de vuelta en casa' : 'Café marcado como terminado');
  };
  const eliminar = async () => {
    if (!(await confirmar({ titulo: '¿Eliminar este café?', texto: 'Sus preparaciones se conservan en el historial.', ok: 'Eliminar', peligro: true }))) return;
    await borrar('cafe_cafes', c.id);
    ir('/cafe/cafes', true);
  };

  return (
    <>
      <BarraDetalle padre="/cafe/cafes" textoAtras="Cafés" derecha={<button type="button" class="bd-accion" onClick={() => editarCafe(c)}>Editar</button>} />
      <div class="pagina">
        {foto && <img class="foto-cabecera" src={foto} alt={`Paquete de ${c.nombre}`} />}
        <section class="ficha-cab">
          <div class="fc-txt">
            <div class="sobre">{c.tostador}</div>
            <h1>{c.nombre}</h1>
            <div class="sub">{descripcionCafe(c)}</div>
          </div>
        </section>

        {!c.terminado && (
          <div class="acciones-fila">
            <button type="button" class="boton-principal" onClick={() => nuevaPreparacion(c.id)}>
              <Icono n="cafe" t={20} /> Preparar con este café
            </button>
          </div>
        )}

        <div class="tit-lista">Reposo{estaCongelado ? ' · congelado' : ''}</div>
        <div class="lista bloque-texto">
          {estaCongelado ? (
            <p class="ayuda">Está en el congelador: el reposo no avanza. Días efectivos: {diasReposo(c) ?? '—'}.</p>
          ) : (
            <>
              <BarraReposo cafe={c} uso="filtro" />
              <BarraReposo cafe={c} uso="espresso" />
            </>
          )}
          <p class="ayuda">Ventanas orientativas según el nivel de tueste. Los tuestes claros necesitan más días, sobre todo para espresso.</p>
        </div>

        {c.pesoG && (
          <>
            <div class="tit-lista">Existencias</div>
            <div class="lista bloque-texto">
              <div class="barra-stock">
                <div style={{ width: `${Math.max(0, Math.min(100, ((st.restante || 0) / c.pesoG) * 100))}%` }} />
              </div>
              <p class="ayuda">
                Quedan unos <b>{fmt(st.restante, 0)} g</b> de {c.pesoG} g
                {ultimaDosis && st.restante ? ` · unas ${Math.floor(st.restante / ultimaDosis)} dosis de ${fmt(ultimaDosis)} g` : ''}. Se descuenta solo con cada preparación.
              </p>
            </div>
          </>
        )}

        {c.notasTostador.length > 0 && (
          <>
            <div class="tit-lista">Notas del tostador</div>
            <div class="lista bloque-texto">
              <div class="chips">
                {c.notasTostador.map((n) => (
                  <span class="chip estatico">{n}</span>
                ))}
              </div>
            </div>
          </>
        )}

        <div class="tit-lista">Ficha</div>
        <dl class="rejilla-datos">
          {datos.filter(([, v]) => v).map(([k, v]) => (
            <div>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {c.notas && <p class="pie">{c.notas}</p>}

        {fichas.length > 0 && (
          <Lista titulo="Aprende sobre este café">
            {fichas.map((f) => (
              <a class="item" href={`#${f.ruta}`}>
                <span class="insignia insignia-cafe" style={{ '--tam': '32px' }}>
                  <Icono n="libro" t={18} />
                </span>
                <div class="item-txt">
                  <div class="item-tit">{f.nombre}</div>
                  <div class="item-meta">{f.tipo}</div>
                </div>
                <Icono n="chevron" t={16} clase="chev" />
              </a>
            ))}
          </Lista>
        )}

        {mejores.length > 0 && (
          <>
            <div class="tit-lista">Mejor receta conocida</div>
            <div class="lista">
              {mejores.map((p) => (
                <a class="item" href={`#/cafe/p/${p.id}`}>
                  <IconoMetodo id={p.metodo} />
                  <div class="item-txt">
                    <div class="item-tit">{metodo(p.metodo).nombre}</div>
                    <div class="item-meta">
                      {fmt(p.dosis)} g · {textoRatio(ratio(p))} · {textoMolienda(p, equipo)}
                      {p.temperatura ? ` · ${p.temperatura} °C` : ''}
                    </div>
                  </div>
                  <Nota p={p.puntuacion} />
                </a>
              ))}
            </div>
          </>
        )}

        {preps.length > 0 && (
          <>
            <div class="tit-lista">Preparaciones ({preps.length})</div>
            <div class="lista">
              {preps.slice(0, 20).map((p) => (
                <a class="item" href={`#/cafe/p/${p.id}`}>
                  <IconoMetodo id={p.metodo} />
                  <div class="item-txt">
                    <div class="item-tit">{metodo(p.metodo).nombre}</div>
                    <div class="item-meta">
                      {p.diasReposo !== undefined ? `Día ${p.diasReposo} · ` : ''}
                      {fmt(p.dosis)} g · {textoRatio(ratio(p))} · {textoMolienda(p, equipo)}
                    </div>
                  </div>
                  <Nota p={p.puntuacion} />
                </a>
              ))}
            </div>
          </>
        )}

        <div class="lista separada">
          <button type="button" class="boton-fila" onClick={alternarCongelado}>
            <Icono n="nieve" t={22} /> {estaCongelado ? 'Sacar del congelador' : 'Meter en el congelador'}
          </button>
          <button type="button" class="boton-fila" onClick={alternarTerminado}>
            <Icono n={c.terminado ? 'reiniciar' : 'check'} t={22} /> {c.terminado ? 'Volver a tenerlo en casa' : 'Marcar como terminado'}
          </button>
          <button type="button" class="boton-fila peligro" onClick={eliminar}>
            <Icono n="papelera" t={22} /> Eliminar café
          </button>
        </div>
      </div>
    </>
  );
}

// ---------- Editor ----------

function EditorCafe({ original, cerrar }: { original: Cafe | null; cerrar: () => void }) {
  const [f, setF] = useState<Partial<Cafe>>(
    () => original || { nombre: '', tostador: '', variedades: [], procesos: [], congelaciones: [], notasTostador: [], tueste: 'medio-claro', uso: 'filtro', fechaTueste: hoyISO() },
  );
  const [notas, setNotas] = useState((original?.notasTostador || []).join(', '));
  const [error, setError] = useState('');
  const set = (p: Partial<Cafe>) => setF((x) => ({ ...x, ...p }));
  const fotoActual = useFoto(f.fotoId);

  const subirFoto = async (e: Event) => {
    const archivo = (e.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    const blob = await comprimirImagen(archivo);
    const id = ulid();
    await db.fotos.put({ id, blob, tipo: blob.type, creado: Date.now() });
    set({ fotoId: id });
  };

  const guardarCafe = async () => {
    if (!f.nombre?.trim()) return setError('nombre'), false;
    const reg = await guardar<Cafe>('cafe_cafes', {
      ...f,
      nombre: f.nombre.trim(),
      tostador: (f.tostador || '').trim() || 'Sin tostador',
      notasTostador: notas.split(',').map((s) => s.trim()).filter(Boolean),
      demo: false,
    });
    if (!original) ir(`/cafe/cafes/${reg.id}`);
  };

  return (
    <Hoja titulo={original ? 'Editar café' : 'Nuevo café'} cerrar={cerrar} guardar={original ? 'Guardar' : 'Añadir'} onGuardar={guardarCafe}>
      <Lista>
        <Campo et="Nombre del café" col clase={error === 'nombre' ? 'error' : ''}>
          <Texto valor={f.nombre || ''} cambiar={(v) => set({ nombre: v })} marcador="Como viene en el paquete" />
        </Campo>
        <Campo et="Tostador" col>
          <Texto valor={f.tostador || ''} cambiar={(v) => set({ tostador: v })} marcador="Marca o tostador" />
        </Campo>
        <label class="campo campo-boton">
          <span class="et">Foto del paquete</span>
          {fotoActual ? <img class="miniatura" src={fotoActual} alt="" style={{ width: '44px', height: '44px' }} /> : <Icono n="camara" t={22} />}
          <input type="file" accept="image/*" hidden onChange={subirFoto} />
        </label>
      </Lista>

      <Lista titulo="Origen">
        <CampoSelector et="País" opciones={PAISES} valor={f.pais ? [f.pais] : []} cambiar={(v) => set({ pais: v[0] })} />
        <Campo et="Región" col>
          <Texto valor={f.region || ''} cambiar={(v) => set({ region: v })} marcador="Huila, Guji, Cerrado…" />
        </Campo>
        <Campo et="Finca o productor" col>
          <Texto valor={f.productor || ''} cambiar={(v) => set({ productor: v })} marcador="Opcional" />
        </Campo>
        <Campo et="Altitud mínima">
          <Numero valor={f.altitudMin} cambiar={(v) => set({ altitudMin: v })} unidad="m" dec={0} />
        </Campo>
        <Campo et="Altitud máxima">
          <Numero valor={f.altitudMax} cambiar={(v) => set({ altitudMax: v })} unidad="m" dec={0} />
        </Campo>
      </Lista>

      <Lista titulo="Café">
        <CampoSelector et="Variedades" opciones={VARIEDADES} valor={f.variedades || []} multiple cambiar={(v) => set({ variedades: v })} />
        <CampoSelector et="Proceso" opciones={PROCESOS} valor={f.procesos || []} multiple cambiar={(v) => set({ procesos: v })} />
        <Campo et="Nivel de tueste" col>
          <div class="chips">
            {TUESTES.map(([v, n]) => (
              <button type="button" class="chip" aria-pressed={f.tueste === v} onClick={() => set({ tueste: v as NivelTueste })}>
                {n}
              </button>
            ))}
          </div>
        </Campo>
        <Campo et="Pensado para" col>
          <Segmentado<UsoCafe> opciones={USOS} valor={f.uso || 'filtro'} cambiar={(v) => set({ uso: v })} />
        </Campo>
        <Campo et="Notas del tostador" sub="Separadas por comas" col>
          <Texto valor={notas} cambiar={setNotas} marcador="Arándano, jazmín, chocolate" />
        </Campo>
      </Lista>

      <Lista titulo="Fechas y compra">
        <Campo et="Fecha de tueste">
          <input type="date" class="fecha" value={f.fechaTueste || ''} max={hoyISO()} onInput={(e) => set({ fechaTueste: (e.target as HTMLInputElement).value || undefined })} />
        </Campo>
        <Campo et="Fecha de apertura">
          <input type="date" class="fecha" value={f.fechaApertura || ''} max={hoyISO()} onInput={(e) => set({ fechaApertura: (e.target as HTMLInputElement).value || undefined })} />
        </Campo>
        <Campo et="Peso del paquete">
          <Ajuste valor={f.pesoG} cambiar={(v) => set({ pesoG: v })} paso={50} min={0} unidad="g" dec={0} etiqueta="peso" />
        </Campo>
        <Campo et="Precio">
          <Numero valor={f.precio} cambiar={(v) => set({ precio: v })} unidad="€" dec={2} />
        </Campo>
      </Lista>

      <Lista titulo="Notas">
        <Campo col>
          <Texto multilinea valor={f.notas || ''} cambiar={(v) => set({ notas: v })} marcador="Dónde lo compraste, impresiones…" />
        </Campo>
      </Lista>
    </Hoja>
  );
}

export const editarCafe = (c: Cafe | null) => abrirHoja((cerrar) => <EditorCafe original={c} cerrar={cerrar} />);

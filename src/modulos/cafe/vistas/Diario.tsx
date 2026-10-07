// CAFÉ · Diario: botón de preparar, cafés en su punto e historial reciente.
import { fechaRelativa, horaCorta } from '../../../core/fechas';
import { ir } from '../../../core/router';
import { useVivo } from '../../../core/vivo';
import { confirmar, mostrarToast } from '../../../ui/capas';
import { Icono } from '../../../ui/Icono';
import { borrador } from '../borrador';
import { estadoReposo, congelado } from '../calculos';
import { metodo } from '../datos/metodos';
import type { Preparacion } from '../modelo';
import { borrarDemo, hayDemo, listarCafes, listarEquipo, listarPreparaciones } from '../repositorio';
import { ChipReposo, IconoMetodo, Nota, resumenPrep } from './comunes';
import { nombreSabor } from '../datos/rueda';
import { nuevaPreparacion } from './Preparar';

export function BotonPreparar() {
  const enCurso = borrador.value && !borrador.value.editando;
  const tempEnMarcha = enCurso && borrador.value?.temporizador?.inicio && !borrador.value.temporizador.terminado;
  return (
    <div class="preparar-bloque">
      <button type="button" class="boton-principal grande" onClick={() => (tempEnMarcha ? ir('/cafe/preparar/temporizador') : nuevaPreparacion())}>
        <Icono n="cafe" t={24} /> {tempEnMarcha ? 'Volver al temporizador' : 'Preparar café'}
      </button>
      {enCurso && !tempEnMarcha && (
        <button type="button" class="enlace-boton" onClick={() => ir('/cafe/preparar')}>
          Continuar la preparación a medias
        </button>
      )}
    </div>
  );
}

export function Diario() {
  const preps = useVivo(listarPreparaciones, []);
  const cafes = useVivo(listarCafes, []) || [];
  const equipo = useVivo(listarEquipo, []) || [];
  const demo = useVivo(hayDemo, []);

  const enPunto = cafes.filter((c) => !c.terminado && !congelado(c) && ['filtro', 'espresso'].some((u) => estadoReposo(c, u as 'filtro').estado === 'optimo'));

  // Agrupa el historial por día.
  const grupos: { dia: string; items: Preparacion[] }[] = [];
  for (const p of preps || []) {
    const dia = fechaRelativa(p.fecha);
    const g = grupos[grupos.length - 1];
    if (g && g.dia === dia) g.items.push(p);
    else grupos.push({ dia, items: [p] });
  }

  const quitarDemo = async () => {
    if (await confirmar({ titulo: '¿Borrar los datos de ejemplo?', texto: 'Se eliminan los 3 cafés y las preparaciones de ejemplo. Tu equipo y lo que hayas registrado tú se quedan.', ok: 'Borrar', peligro: true })) {
      await borrarDemo();
      mostrarToast('Datos de ejemplo borrados');
    }
  };

  return (
    <>
      <BotonPreparar />

      {demo && (
        <div class="aviso-demo">
          <Icono n="info" t={18} />
          <span>Estás viendo datos de ejemplo para probar la app.</span>
          <button type="button" onClick={quitarDemo}>
            Borrar
          </button>
        </div>
      )}

      {enPunto.length > 0 && (
        <>
          <div class="tit-lista">En su punto de reposo</div>
          <div class="lista">
            {enPunto.slice(0, 4).map((c) => {
              const uso = c.uso === 'espresso' ? 'espresso' : estadoReposo(c, 'filtro').estado === 'optimo' ? 'filtro' : 'espresso';
              return (
                <button type="button" class="item" onClick={() => ir(`/cafe/cafes/${c.id}`)}>
                  <span class="insignia insignia-cafe" style={{ '--tam': '36px' }}>
                    <Icono n="grano" t={21} />
                  </span>
                  <div class="item-txt">
                    <div class="item-tit">{c.nombre}</div>
                    <ChipReposo cafe={c} uso={uso} />
                  </div>
                  <Icono n="chevron" t={16} clase="chev" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {preps && preps.length === 0 && (
        <div class="vacio">
          <Icono n="cafe" t={44} />
          <p>Aún no has registrado ninguna preparación.</p>
          <p class="pie">Pulsa «Preparar café» para empezar.</p>
        </div>
      )}

      {grupos.map((g) => (
        <section>
          <div class="tit-lista">{g.dia}</div>
          <div class="lista">
            {g.items.map((p) => (
              <a class="item" href={`#/cafe/p/${p.id}`}>
                <IconoMetodo id={p.metodo} />
                <div class="item-txt">
                  <div class="item-tit">
                    {metodo(p.metodo).nombre} · {p.cafeNombre || 'Sin registrar'}
                  </div>
                  <div class="item-meta">
                    {horaCorta(p.fecha)} · {resumenPrep(p, equipo)}
                  </div>
                  {p.cata?.sabores.length ? <div class="item-meta sabores-linea">{p.cata.sabores.slice(0, 4).map(nombreSabor).join(' · ')}</div> : null}
                </div>
                <Nota p={p.puntuacion} />
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

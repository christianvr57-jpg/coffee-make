// COCINA · Guía: reglas de alimentación del niño de 1 año y criterios del menú, con fuentes.
import { Icono } from '../../../ui/Icono';
import { CRITERIOS_SEMANA, FUENTES, GUIA_NINO, type Apartado } from '../datos/guia';

function Bloques({ apartados }: { apartados: Apartado[] }) {
  return (
    <div class="paneles">
      {apartados.map((a) => (
        <section>
          <div class="tit-lista">{a.titulo}</div>
          <ul class="lista bloque-texto consejos">
            {a.puntos.map((p) => (
              <li>{p}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function GuiaCocina() {
  return (
    <>
      <div class="aviso-suave">
        <Icono n="info" t={18} />
        <span>Pautas generales de fuentes oficiales para un niño sano de 1 año. Ante cualquier duda concreta, manda el pediatra.</span>
      </div>
      <h2 class="titulo-seccion">El niño (1 año)</h2>
      <Bloques apartados={GUIA_NINO} />
      <h2 class="titulo-seccion">El menú</h2>
      <Bloques apartados={CRITERIOS_SEMANA} />
      <div class="tit-lista">Fuentes</div>
      <div class="lista rejilla-tarjetas">
        {FUENTES.map((f) => (
          <a class="item" href={f.url} target="_blank" rel="noopener noreferrer">
            <span class="insignia" style={{ '--tam': '32px' }}>
              <Icono n="libro" t={18} />
            </span>
            <div class="item-txt">
              <div class="item-tit fuente-tit">{f.titulo}</div>
              <div class="item-meta">{new URL(f.url).hostname.replace(/^www\./, '')}</div>
            </div>
            <Icono n="chevron" t={16} clase="chev" />
          </a>
        ))}
      </div>
    </>
  );
}

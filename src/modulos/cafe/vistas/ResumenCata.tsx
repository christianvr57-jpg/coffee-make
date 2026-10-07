// Resumen de una cata: sabores, perfil de atributos (barras) y defectos.
import { AGRADO, ATRIBUTOS, DEFECTOS, INTENSIDAD, TIPOS_ACIDEZ } from '../datos/cata';
import type { Cata } from '../modelo';
import { ChipsSabores } from './Rueda';

export function ResumenCata({ cata }: { cata: Cata }) {
  const valorados = ATRIBUTOS.filter((a) => cata.atributos[a.id]?.agrado || cata.atributos[a.id]?.intensidad);
  return (
    <>
      <div class="tit-lista">Cata</div>
      <div class="lista bloque-texto">
        {cata.sabores.length > 0 && <ChipsSabores ids={cata.sabores} />}
        {valorados.length > 0 && (
          <div class="perfil">
            {valorados.map((a) => {
              const v = cata.atributos[a.id]!;
              const extra = [
                v.intensidad ? `intensidad ${INTENSIDAD[v.intensidad].toLowerCase()}` : '',
                a.id === 'acidez' && cata.acidezTipos.length ? cata.acidezTipos.map((t) => TIPOS_ACIDEZ.find((x) => x.id === t)?.nombre.toLowerCase()).join(', ') : '',
                a.id === 'cuerpo' && cata.textura ? cata.textura.toLowerCase() : '',
              ].filter(Boolean);
              return (
                <div class="perfil-fila">
                  <span class="pf-nombre">{a.nombre}</span>
                  <div class="pf-barra" title={v.agrado ? AGRADO[v.agrado] : 'Sin valorar'}>
                    <div class={`ag-${v.agrado || 0}`} style={{ width: `${((v.agrado || 0) / 5) * 100}%` }} />
                  </div>
                  <span class="pf-extra">{extra.join(' · ')}</span>
                </div>
              );
            })}
          </div>
        )}
        {cata.defectos.length > 0 && (
          <p class="ayuda">
            <b>Defectos:</b> {cata.defectos.map((d) => DEFECTOS.find((x) => x.id === d)?.nombre || d).join(', ')}
          </p>
        )}
      </div>
    </>
  );
}

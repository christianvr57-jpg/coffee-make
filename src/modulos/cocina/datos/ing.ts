// Notación compacta de ingredientes: "v:Cebolla 50, Ajo 5; p:Merluza en lomos 170; d:Laurel".
// Prefijos de categoría: v verduras y frutas, p pescado/carne/huevos, l lácteos, c cereales y
// legumbres, d despensa. El número final son los gramos en crudo de UNA ración de adulto de
// referencia; sin número = al gusto (no se escala ni cuenta calorías).
import type { Categoria, Ingrediente } from '../tipos';

const CAT: Record<string, Categoria> = { v: 'fruta-verdura', p: 'proteina', l: 'lacteo', c: 'cereal-legumbre', d: 'despensa' };

export function ing(s: string): Ingrediente[] {
  return s.split(';').flatMap((grupo) => {
    const [k, lista] = grupo.split(':');
    return lista.split(',').map((x) => {
      const m = x.trim().match(/^(.*?)\s+(\d+(?:\.\d+)?)$/);
      return m ? { n: m[1], c: CAT[k.trim()], g: Number(m[2]) } : { n: x.trim(), c: CAT[k.trim()] };
    });
  });
}

export const AOVE = 'Aceite de oliva virgen extra';
export const LEGUMBRE_COCIDA = 'Si no la tienes cocida del domingo, usa legumbre de bote bien enjuagada.';

/**
 * generateAvatar.js
 * Genera URL de avatar usando DiceBear Avataaars API
 * Documentación: https://www.dicebear.com/styles/avataaars
 */

const BASE = 'https://api.dicebear.com/7.x/avataaars/svg';

export const AVATAR_OPTIONS = {
  // Tipo de arriba (pelo/sombrero)
  top: [
    { id:'shortHairShortFlat',       label:'Corto liso' },
    { id:'shortHairShortRound',      label:'Corto redondo' },
    { id:'shortHairShortWaved',      label:'Corto ondulado' },
    { id:'shortHairDreads01',        label:'Dreadlocks cortos' },
    { id:'longHairStraight',         label:'Largo liso' },
    { id:'longHairStraight2',        label:'Largo liso 2' },
    { id:'longHairCurly',            label:'Largo rizado' },
    { id:'longHairBun',              label:'Moño' },
    { id:'longHairBob',              label:'Bob' },
    { id:'longHairFro',              label:'Afro largo' },
    { id:'shortHairFrizzle',         label:'Afro corto' },
    { id:'hat',                      label:'Gorro' },
    { id:'hijab',                    label:'Hijab' },
    { id:'turban',                   label:'Turbante' },
    { id:'winterHat1',               label:'Gorro invierno' },
    { id:'eyepatch',                 label:'Parche ojo' },
  ],

  // Color de pelo
  hairColor: [
    { id:'2c1b18', label:'Negro',      hex:'#2c1b18' },
    { id:'4a312c', label:'Castaño',    hex:'#4a312c' },
    { id:'724133', label:'Castaño claro', hex:'#724133' },
    { id:'a55728', label:'Rojizo',     hex:'#a55728' },
    { id:'b58143', label:'Rubio oscuro', hex:'#b58143' },
    { id:'d6b370', label:'Rubio',      hex:'#d6b370' },
    { id:'ecdcbf', label:'Rubio claro', hex:'#ecdcbf' },
    { id:'c93305', label:'Rojo fuego', hex:'#c93305' },
    { id:'e8e1e1', label:'Gris',       hex:'#e8e1e1' },
    { id:'f59797', label:'Rosa',       hex:'#f59797' },
    { id:'3eac2c', label:'Verde',      hex:'#3eac2c' },
    { id:'0e0e0e', label:'Azul noche', hex:'#0e0e0e' },
  ],

  // Accesorios faciales
  accessories: [
    { id:'blank',        label:'Ninguno' },
    { id:'prescription01', label:'Gafas graduadas' },
    { id:'prescription02', label:'Gafas redondas' },
    { id:'round',        label:'Gafas ovaladas' },
    { id:'sunglasses',   label:'Gafas de sol' },
    { id:'wayfarers',    label:'Wayfarer' },
    { id:'kurt',         label:'Kurt' },
  ],

  // Tipo de cara / vello facial
  facialHair: [
    { id:'blank',        label:'Sin vello' },
    { id:'beardMedium',  label:'Barba media' },
    { id:'beardLight',   label:'Barba corta' },
    { id:'beardMagestic',label:'Barba larga' },
    { id:'moustacheFancy', label:'Bigote fancy' },
    { id:'moustacheMagnum', label:'Bigote magnum' },
  ],

  // Color del vello facial
  facialHairColor: [
    { id:'2c1b18', label:'Negro',      hex:'#2c1b18' },
    { id:'4a312c', label:'Castaño',    hex:'#4a312c' },
    { id:'a55728', label:'Rojizo',     hex:'#a55728' },
    { id:'b58143', label:'Rubio',      hex:'#b58143' },
    { id:'e8e1e1', label:'Gris',       hex:'#e8e1e1' },
    { id:'c93305', label:'Rojo fuego', hex:'#c93305' },
  ],

  // Ropa
  clothe: [
    { id:'blazerShirt',      label:'Blazer + camisa' },
    { id:'blazerSweater',    label:'Blazer + jersey' },
    { id:'collarSweater',    label:'Jersey cuello' },
    { id:'graphicShirt',     label:'Camiseta gráfica' },
    { id:'hoodie',           label:'Hoodie' },
    { id:'overall',          label:'Mono' },
    { id:'shirtCrewNeck',    label:'Camiseta cuello redondo' },
    { id:'shirtScoopNeck',   label:'Camiseta escote' },
    { id:'shirtVNeck',       label:'Camiseta V' },
  ],

  // Color de ropa
  clotheColor: [
    { id:'262e33', label:'Negro',      hex:'#262e33' },
    { id:'3c4f5c', label:'Gris oscuro', hex:'#3c4f5c' },
    { id:'65c9ff', label:'Azul claro', hex:'#65c9ff' },
    { id:'5199e4', label:'Azul',       hex:'#5199e4' },
    { id:'25557c', label:'Azul marino', hex:'#25557c' },
    { id:'e6e6e6', label:'Gris claro', hex:'#e6e6e6' },
    { id:'929598', label:'Gris',       hex:'#929598' },
    { id:'a7ffc4', label:'Verde menta', hex:'#a7ffc4' },
    { id:'ff5c5c', label:'Rojo',       hex:'#ff5c5c' },
    { id:'ff488e', label:'Rosa',       hex:'#ff488e' },
    { id:'ffafb9', label:'Rosa claro', hex:'#ffafb9' },
    { id:'ffffb1', label:'Amarillo',   hex:'#ffffb1' },
    { id:'ff5b5b', label:'Naranja',    hex:'#ff5b5b' },
    { id:'ffffff', label:'Blanco',     hex:'#ffffff' },
  ],

  // Tono de piel
  skin: [
    { id:'tanned',       label:'Bronceado',   hex:'#FD9841' },
    { id:'yellow',       label:'Amarillo',    hex:'#F8D25C' },
    { id:'pale',         label:'Pálido',      hex:'#FFDBB4' },
    { id:'light',        label:'Claro',       hex:'#EDB98A' },
    { id:'brown',        label:'Moreno',      hex:'#D08B5B' },
    { id:'darkBrown',    label:'Oscuro',      hex:'#AE5D29' },
    { id:'black',        label:'Negro',       hex:'#614335' },
  ],

  // Ojos
  eyes: [
    { id:'default',      label:'Normal' },
    { id:'closed',       label:'Cerrados' },
    { id:'cry',          label:'Llorando' },
    { id:'dizzy',        label:'Mareado' },
    { id:'eyeRoll',      label:'En blanco' },
    { id:'happy',        label:'Feliz' },
    { id:'hearts',       label:'Corazones' },
    { id:'side',         label:'Lateral' },
    { id:'squint',       label:'Entornados' },
    { id:'surprised',    label:'Sorprendido' },
    { id:'wink',         label:'Guiño' },
    { id:'winkWacky',    label:'Guiño loco' },
    { id:'xDizzy',       label:'KO' },
  ],

  // Cejas
  eyebrow: [
    { id:'default',              label:'Normal' },
    { id:'defaultNatural',       label:'Natural' },
    { id:'flatNatural',          label:'Planas' },
    { id:'raisedExcited',        label:'Levantadas' },
    { id:'raisedExcitedNatural', label:'Levantadas natural' },
    { id:'sadConcerned',         label:'Triste' },
    { id:'sadConcernedNatural',  label:'Preocupado' },
    { id:'unibrow',              label:'Moneja' },
    { id:'upDown',               label:'Arriba-abajo' },
    { id:'upDownNatural',        label:'Arriba-abajo natural' },
  ],

  // Boca
  mouth: [
    { id:'default',      label:'Normal' },
    { id:'concerned',    label:'Preocupado' },
    { id:'disbelief',    label:'Incredulidad' },
    { id:'eating',       label:'Comiendo' },
    { id:'grimace',      label:'Mueca' },
    { id:'sad',          label:'Triste' },
    { id:'screamOpen',   label:'Gritando' },
    { id:'serious',      label:'Serio' },
    { id:'smile',        label:'Sonrisa' },
    { id:'tongue',       label:'Lengua' },
    { id:'twinkle',      label:'Coqueto' },
    { id:'vomit',        label:'Asqueado' },
  ],
};

export const DEFAULT_AVATAR = {
  top:              'shortHairShortFlat',
  hairColor:        '2c1b18',
  accessories:      'blank',
  facialHair:       'blank',
  facialHairColor:  '2c1b18',
  clothe:           'hoodie',
  clotheColor:      '262e33',
  skin:             'light',
  eyes:             'default',
  eyebrow:          'default',
  mouth:            'default',
};

/**
 * Genera la URL del avatar en DiceBear
 * @param {object} config - Configuración del avatar
 * @param {number} size - Tamaño en px (default 200)
 * @returns {string} URL del SVG
 */
export function generateAvatarUrl(config = {}, size = 200) {
  const c = { ...DEFAULT_AVATAR, ...config };
  const params = new URLSearchParams({
    seed:             c.top + c.hairColor + c.clothe,
    top:              c.top,
    hairColor:        c.hairColor,
    accessories:      c.accessories,
    facialHair:       c.facialHair,
    facialHairColor:  c.facialHairColor,
    clothe:           c.clothe,
    clotheColor:      c.clotheColor,
    skin:             c.skin,
    eyes:             c.eyes,
    eyebrow:          c.eyebrow,
    mouth:            c.mouth,
    size:             size,
    backgroundColor:  'transparent',
  });
  return `${BASE}?${params.toString()}`;
}

/**
 * Calcula el número total de combinaciones posibles
 */
export function totalCombinations() {
  return Object.values(AVATAR_OPTIONS).reduce((acc, arr) => acc * arr.length, 1);
}

/**
 * Genera una configuración aleatoria
 */
export function randomAvatarConfig() {
  const config = {};
  Object.entries(AVATAR_OPTIONS).forEach(([key, options]) => {
    config[key] = options[Math.floor(Math.random() * options.length)].id;
  });
  return config;
}
/**
 * Awatary profilu — rysunkowe twarze generowane lokalnie przez bibliotekę DiceBear
 * (kolekcja „avataaars"). 6 gotowych presetów: 4 kobiety + 2 mężczyzn.
 * SVG budowane są w przeglądarce (offline-friendly) i cache'owane per preset.
 */
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

export type ProfileAvatarId = 'ola' | 'kasia' | 'marta' | 'zofia' | 'piotr' | 'tomek';

export type ProfileAvatarDef = {
  id: ProfileAvatarId;
  label: string;
  gender: 'female' | 'male';
  /** Opcje avataaars — dobrane tak, by wymusić płeć (fryzura + zarost). */
  options: Record<string, unknown>;
};

const COMMON = {
  accessoriesProbability: 0,
  clothing: ['blazerAndShirt', 'collarAndSweater', 'hoodie', 'shirtCrewNeck'],
  // Wymuszamy przyjazną mimikę, by avataaars nie wylosował np. miny „vomit".
  mouth: ['smile'],
  eyes: ['default'],
  eyebrows: ['default'],
};

export const PROFILE_AVATARS: ProfileAvatarDef[] = [
  {
    id: 'ola',
    label: 'Ola',
    gender: 'female',
    options: {
      seed: 'Ola',
      top: ['straightAndStrand'],
      hairColor: ['4a312c'],
      skinColor: ['edb98a'],
      facialHairProbability: 0,
      backgroundColor: ['c0aede'],
    },
  },
  {
    id: 'kasia',
    label: 'Kasia',
    gender: 'female',
    options: {
      seed: 'Kasia',
      top: ['straight02'],
      hairColor: ['2c1b18'],
      skinColor: ['ffdbb4'],
      facialHairProbability: 0,
      backgroundColor: ['b6e3f4'],
    },
  },
  {
    id: 'marta',
    label: 'Marta',
    gender: 'female',
    options: {
      seed: 'Marta',
      top: ['curly'],
      hairColor: ['a55728'],
      skinColor: ['d08b5b'],
      facialHairProbability: 0,
      backgroundColor: ['ffd5dc'],
    },
  },
  {
    id: 'zofia',
    label: 'Zofia',
    gender: 'female',
    options: {
      seed: 'Zofia',
      top: ['bob'],
      hairColor: ['b58143'],
      skinColor: ['ffdbb4'],
      facialHairProbability: 0,
      backgroundColor: ['ffdfbf'],
    },
  },
  {
    id: 'piotr',
    label: 'Piotr',
    gender: 'male',
    options: {
      seed: 'Piotr',
      top: ['shortFlat'],
      hairColor: ['2c1b18'],
      skinColor: ['edb98a'],
      facialHair: ['beardMedium'],
      facialHairColor: ['2c1b18'],
      facialHairProbability: 100,
      backgroundColor: ['d1d4f9'],
    },
  },
  {
    id: 'tomek',
    label: 'Tomek',
    gender: 'male',
    options: {
      seed: 'Tomek',
      top: ['shortCurly'],
      hairColor: ['724133'],
      skinColor: ['ffdbb4'],
      facialHair: ['beardLight'],
      facialHairColor: ['724133'],
      facialHairProbability: 100,
      backgroundColor: ['c0e8d5'],
    },
  },
];

export const DEFAULT_PROFILE_AVATAR_ID: ProfileAvatarId = 'ola';

export function isProfileAvatarId(value: string): value is ProfileAvatarId {
  return PROFILE_AVATARS.some((avatar) => avatar.id === value);
}

export function getProfileAvatar(id?: string | null): ProfileAvatarDef {
  if (id && isProfileAvatarId(id)) {
    return PROFILE_AVATARS.find((avatar) => avatar.id === id) ?? PROFILE_AVATARS[0];
  }
  return PROFILE_AVATARS[0];
}

const uriCache = new Map<ProfileAvatarId, string>();

/** Zwraca data-URI z gotowym SVG awatara (budowane raz, potem z cache). */
export function getProfileAvatarUri(id?: string | null): string {
  const def = getProfileAvatar(id);
  const cached = uriCache.get(def.id);
  if (cached) return cached;
  // avataaars ma ściśle typowane opcje; presety trzymamy luźno, więc rzutujemy.
  const options = { size: 128, ...COMMON, ...def.options } as any;
  const svg = createAvatar(avataaars, options).toString();
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  uriCache.set(def.id, uri);
  return uri;
}

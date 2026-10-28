import { en, type Dictionary } from "./en";
import { es } from "./es";

export type { Dictionary };

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries: Record<Locale, Dictionary> = { en, es };

export const getDictionary = (locale: Locale) => dictionaries[locale];

export const localePath = (locale: Locale) =>
  locale === defaultLocale ? "/" : `/${locale}/`;

/** Replaces {name} placeholders: fmt("{n} of {total}", { n: 1, total: 4 }) */
export const fmt = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));

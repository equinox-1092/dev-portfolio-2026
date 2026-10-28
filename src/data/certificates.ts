import type { Dictionary } from "../i18n";

export interface Certificate {
  /** Must match a key in i18n `certificates.tags`. */
  id: keyof Dictionary["certificates"]["tags"];
  /** Official course title, kept as printed on the certificate. */
  title: string;
  issuer: string;
  /** ISO date: "2025-05-10", or "2025-09" when only the month is known. */
  date: string;
  image: string;
  width: number;
  height: number;
}

const realCertificates: Certificate[] = [
  {
    id: "python",
    title: "Python Data Structures",
    issuer: "University of Michigan · Coursera",
    date: "2025-05-10",
    image: "/certificate/certificado-1.webp",
    width: 1224,
    height: 948,
  },
  {
    id: "sql",
    title: "SQL for Data Science",
    issuer: "UC Davis · Coursera",
    date: "2024-08-29",
    image: "/certificate/certificado-2.webp",
    width: 1043,
    height: 805,
  },
  {
    id: "wrangling",
    title: "Data Wrangling, Analysis and AB Testing with SQL",
    issuer: "UC Davis · Coursera",
    date: "2024-09-14",
    image: "/certificate/certificado-3.webp",
    width: 1046,
    height: 808,
  },
  {
    id: "cloud",
    title: "Cloud Computing: AWS, Azure, Google Cloud",
    issuer: "CTIC · Universidad Nacional de Ingeniería",
    date: "2025-09",
    image: "/certificate/certificado-4.webp",
    width: 1109,
    height: 786,
  },
];

// `PUBLIC_DATA=worst` swaps in the stress-test fixture. Never set it for a deploy.
export const certificates: Certificate[] =
  import.meta.env.PUBLIC_DATA === "worst"
    ? (await import("./fixtures/certificates.worst")).worstCertificates
    : realCertificates;

export const formatCertificateDate = (date: string, locale: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    ...(day ? { day: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1)));
};

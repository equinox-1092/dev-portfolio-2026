import type { Certificate } from "../certificates";

// Worst realistic case for the certificate wheel (break-ui). Testing only:
// run `PUBLIC_DATA=worst pnpm dev` (or build) to render the page with this list instead of the real one.
// Covers: many items (wheel must not wrap onto itself), very long official titles and issuers,
// month-only dates, and portrait/landscape images mixed.
const images = [
  { image: "/certificate/certificado-1.webp", width: 1224, height: 948 },
  { image: "/certificate/certificado-2.webp", width: 1043, height: 805 },
  { image: "/certificate/certificado-3.webp", width: 1046, height: 808 },
  { image: "/certificate/certificado-4.webp", width: 1109, height: 786 },
];

const rows: Omit<Certificate, "image" | "width" | "height">[] = [
  { id: "cloud", title: "Google Cloud Professional Cloud Architect: Designing, Planning and Managing Enterprise Solutions", issuer: "Google Cloud Training Online · Coursera Specialization Program", date: "2025-11" },
  { id: "python", title: "Python", issuer: "UNI", date: "2023-01-03" },
  { id: "sql", title: "Data Wrangling, Analysis and AB Testing with SQL", issuer: "University of California, Davis · Coursera", date: "2024-09-14" },
  { id: "wrangling", title: "Introducción a la Ingeniería de Requisitos y Especificación de Software Orientada a Objetos", issuer: "Pontificia Universidad Católica del Perú", date: "2024-12" },
  { id: "python", title: "Python Data Structures", issuer: "University of Michigan · Coursera", date: "2025-05-10" },
  { id: "cloud", title: "AWS Certified Solutions Architect – Associate", issuer: "Amazon Web Services", date: "2025-02" },
  { id: "sql", title: "SQL for Data Science", issuer: "UC Davis · Coursera", date: "2024-08-29" },
  { id: "wrangling", title: "Front-End Web Development with React", issuer: "The Hong Kong University of Science and Technology", date: "2024-03-21" },
  { id: "cloud", title: "Cloud Computing: AWS, Azure, Google Cloud", issuer: "CTIC · Universidad Nacional de Ingeniería", date: "2025-09" },
  { id: "python", title: "Programming for Everybody (Getting Started with Python)", issuer: "University of Michigan · Coursera", date: "2023-06-30" },
  { id: "sql", title: "Databases and SQL for Data Science with Python", issuer: "IBM Skills Network", date: "2024-01" },
  { id: "wrangling", title: "Agile with Atlassian Jira", issuer: "Atlassian", date: "2023-10-02" },
];

export const worstCertificates: Certificate[] = rows.map((row, i) => ({ ...row, ...images[i % images.length] }));

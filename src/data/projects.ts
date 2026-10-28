import type { Dictionary } from "../i18n";

type ProjectCopy = Dictionary["work"]["projects"];
export type ProjectId = keyof ProjectCopy;

export interface Course {
  id: keyof ProjectCopy[ProjectId]["courses"];
  cycle: number;
  requires: Course["id"][];
}

export interface Project {
  /** Must match a key in i18n `work.projects`. Add the copy there in both languages. */
  id: ProjectId;
  name: string;
  year: number;
  tech: string[];
  repo?: string;
  /** Sample data for the interactive prerequisite map. Leave out to hide the map. */
  curriculum?: Course[];
}

export const projects: Project[] = [
  {
    id: "edugraph",
    name: "EduGraph",
    year: 2025,
    tech: ["Next.js", "Tailwind", "FastAPI", "MySQL", "Figma"],
    repo: "https://github.com/edugraph-ods",
    curriculum: [
      { id: "math", cycle: 1, requires: [] },
      { id: "prog", cycle: 1, requires: [] },
      { id: "calc", cycle: 2, requires: ["math"] },
      { id: "algo", cycle: 2, requires: ["prog"] },
      { id: "phys", cycle: 3, requires: ["calc"] },
      { id: "ds", cycle: 3, requires: ["algo"] },
      { id: "db", cycle: 4, requires: ["ds"] },
      { id: "web", cycle: 4, requires: ["ds", "prog"] },
    ],
  },
];

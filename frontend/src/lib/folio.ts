import type { Project } from "../services/api.ts";

export function folio(project: Pick<Project, "id" | "createdAt">): string {
  const year = new Date(project.createdAt).getUTCFullYear();
  const ref = project.id.slice(0, 4).toUpperCase();
  return `EST-${year}-${ref}`;
}

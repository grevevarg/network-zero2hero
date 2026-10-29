import { buildCourse, opaqueId, parseContent } from "../../src/build/course.ts";
import type { ClientCourse } from "../../src/types.ts";
import { rawContent } from "../fixtures/content.ts";

export async function fixtureCourse(): Promise<ClientCourse> {
  return buildCourse(parseContent(rawContent()));
}

/** Visible text of an option, looked up by its authored id. */
export function textOf(course: ClientCourse, questionId: string, authoredId: string): string {
  const q = course.sections.flatMap((s) => s.questions).find((x) => x.id === questionId);
  const id = opaqueId(questionId, authoredId);
  const all = q ? ("options" in q ? q.options : "items" in q ? q.items : "left" in q ? [...q.left, ...q.right] : []) : [];
  return all.find((c) => c.id === id)?.html.replace(/<[^>]+>/g, "") ?? "";
}

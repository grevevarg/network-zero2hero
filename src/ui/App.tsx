import { useEffect, useState } from "preact/hooks";
import { loadProgress, markSolved, resetProgress, saveProgress, type Progress } from "../lib/storage.ts";
import type { ClientCourse } from "../types.ts";
import { Home } from "./Home.tsx";
import { parseHash } from "./router.ts";
import { SectionPage } from "./SectionPage.tsx";

type Props = { course: ClientCourse; storage: Storage | undefined; seed: string; confirmReset: () => boolean };

export function App({ course, storage, seed, confirmReset }: Props) {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  const [progress, setProgress] = useState<Progress>(() => loadProgress(storage));

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = route.page === "section"
      ? `${course.sections.find((s) => s.id === route.id)?.title ?? "Okänt avsnitt"} · ${course.title}`
      : course.title;
  }, [route, course]);

  const solved = new Set(progress.solved);

  function onSolved(id: string) {
    setProgress((p) => {
      const next = markSolved(p, id);
      saveProgress(storage, next);
      return next;
    });
  }

  function onReset() {
    if (confirmReset()) setProgress(resetProgress(storage));
  }

  if (route.page === "section") {
    const index = course.sections.findIndex((s) => s.id === route.id);
    if (index >= 0) {
      return (
        <SectionPage
          key={route.id}
          section={course.sections[index]}
          previous={course.sections[index - 1]}
          next={course.sections[index + 1]}
          solved={solved}
          seed={seed}
          onSolved={onSolved}
        />
      );
    }
  }
  return <Home course={course} solved={solved} onReset={onReset} />;
}

import { useEffect, useState } from "preact/hooks";
import {
  loadProgress,
  markSolved,
  resetProgress,
  saveProgress,
  setPosition,
  type Progress,
} from "../lib/storage.ts";
import type { ClientCourse } from "../types.ts";
import { Deck } from "./Deck.tsx";
import { Home } from "./Home.tsx";
import { parseHash } from "./router.ts";

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

  function update(change: (p: Progress) => Progress) {
    setProgress((p) => {
      const next = change(p);
      if (next !== p) saveProgress(storage, next);
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
        <Deck
          key={`${route.id}/${route.card ?? 1}`}
          section={course.sections[index]}
          next={course.sections[index + 1]}
          startCard={route.card ?? 1}
          solved={new Set(progress.solved)}
          seed={seed}
          onSolved={(id) => update((p) => markSolved(p, id))}
          onPosition={(id, card) => update((p) => setPosition(p, id, card))}
        />
      );
    }
  }
  return <Home course={course} progress={progress} onReset={onReset} />;
}

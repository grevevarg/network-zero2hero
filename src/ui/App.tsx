import { useEffect, useRef, useState } from "preact/hooks";
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
import { followSystem } from "../lib/theme.ts";
import { Home } from "./Home.tsx";
import { parseHash } from "./router.ts";

type Props = { course: ClientCourse; storage: Storage | undefined; seed: string; confirmReset: () => boolean };

export function App({ course, storage, seed, confirmReset }: Props) {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  const [progress, setProgress] = useState<Progress>(() => loadProgress(storage));
  // A new shuffle seed each time a section is entered. Moving between its cards (or trying a
  // question again) keeps the order; leaving the section, for the overview or another section,
  // gives a fresh one next time.
  const visit = useRef<{ id: string | undefined; n: number }>({ id: undefined, n: 0 });
  const sectionId = route.page === "section" ? route.id : undefined;
  if (visit.current.id !== sectionId) visit.current = { id: sectionId, n: visit.current.n + 1 };

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // index.html picks the theme before first paint; from here on, keep following the system's
  // light/dark setting for readers who haven't picked a theme.
  useEffect(() => followSystem(window, storage), [storage]);

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
          seed={`${seed}:${visit.current.n}`}
          onSolved={(id) => update((p) => markSolved(p, id))}
          onPosition={(id, card) => update((p) => setPosition(p, id, card))}
        />
      );
    }
  }
  return <Home course={course} progress={progress} storage={storage} onReset={onReset} />;
}

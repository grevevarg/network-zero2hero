import type { ClientQuestion } from "../types.ts";
import { Matching } from "./Matching.tsx";
import { Mcq } from "./Mcq.tsx";
import { Ordering } from "./Ordering.tsx";

type Props = { question: ClientQuestion; seed: string; solved: boolean; onSolved: (id: string) => void };

export function Question({ question, seed, solved, onSolved }: Props) {
  return (
    <article class={`question-card${solved ? " solved" : ""}`}>
      {solved ? <p class="badge">Klarad tidigare</p> : null}
      {question.kind === "mcq" ? (
        <Mcq question={question} seed={seed} onSolved={onSolved} />
      ) : question.kind === "ordering" ? (
        <Ordering question={question} seed={seed} onSolved={onSolved} />
      ) : (
        <Matching question={question} seed={seed} onSolved={onSolved} />
      )}
    </article>
  );
}

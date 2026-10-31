import type { ClientQuestion } from "../types.ts";
import { Fill } from "./Fill.tsx";
import { Matching } from "./Matching.tsx";
import { Mcq } from "./Mcq.tsx";
import { Ordering } from "./Ordering.tsx";
import { Slots } from "./Slots.tsx";

type Props = {
  question: ClientQuestion;
  seed: string;
  solved: boolean;
  onSolved: (id: string) => void;
  onAnswered: (id: string) => void;
};

export function Question({ question, seed, solved, onSolved, onAnswered }: Props) {
  const handlers = { seed, onSolved, onAnswered };
  return (
    <div class={`question-body${solved ? " solved" : ""}`}>
      {solved ? <p class="badge">Klarad</p> : null}
      {question.kind === "mcq" ? (
        <Mcq question={question} {...handlers} />
      ) : question.kind === "ordering" ? (
        <Ordering question={question} {...handlers} />
      ) : question.kind === "matching" ? (
        <Matching question={question} {...handlers} />
      ) : question.kind === "slots" ? (
        <Slots question={question} {...handlers} />
      ) : (
        <Fill question={question} {...handlers} />
      )}
    </div>
  );
}

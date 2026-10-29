import { Html } from "./Html.tsx";

export type Verdict = "right" | "wrong" | undefined;

type Props = { verdict: Verdict; explanationHtml?: string; showExplanation: boolean; wrongHint: string };

export function Feedback({ verdict, explanationHtml, showExplanation, wrongHint }: Props) {
  if (verdict === undefined) return null;
  return (
    <div class={`feedback feedback-${verdict}`} role="status">
      <p class="verdict">{verdict === "right" ? "Rätt." : `Inte riktigt. ${wrongHint}`}</p>
      {showExplanation && explanationHtml !== undefined ? <Html html={explanationHtml} className="explanation" /> : null}
    </div>
  );
}

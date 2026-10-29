/** Renders HTML that the build step produced from our own Markdown. Never used for user input. */
export function Html({ html, as: Tag = "div", className }: { html: string; as?: "div" | "span"; className?: string }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

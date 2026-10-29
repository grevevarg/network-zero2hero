import { render } from "preact";
import course from "virtual:course";
import { browserStorage } from "./lib/storage.ts";
import { App } from "./ui/App.tsx";
import "./styles.css";

render(
  <App
    course={course}
    storage={browserStorage()}
    seed={String(Math.random())}
    confirmReset={() => window.confirm("Vill du nollställa alla sparade svar?")}
  />,
  document.getElementById("app") as HTMLElement,
);

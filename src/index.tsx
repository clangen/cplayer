/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App";
import { PlaybackProvider } from "./PlaybackContext";

render(
  () => (
    <PlaybackProvider>
      <App />
    </PlaybackProvider>
  ),
  document.getElementById("root") as HTMLElement
);

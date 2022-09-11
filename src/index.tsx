/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App";
import { PlaybackProvider } from "./PlaybackContext";
import { ManifestProvider } from "./ManifestContext";

render(
  () => (
    <ManifestProvider>
      <PlaybackProvider>
        <App />
      </PlaybackProvider>
    </ManifestProvider>
  ),
  document.getElementById("root") as HTMLElement
);

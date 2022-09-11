/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App";
import { PlaybackProvider } from "./PlaybackContext";
import { AlbumManifestProvider } from "./AlbumManifestContext";

render(
  () => (
    <AlbumManifestProvider>
      <PlaybackProvider>
        <App />
      </PlaybackProvider>
    </AlbumManifestProvider>
  ),
  document.getElementById("root") as HTMLElement
);

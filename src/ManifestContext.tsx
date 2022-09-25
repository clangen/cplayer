import _ from "lodash";
import { createContext, Component, createSignal } from "solid-js";
import { Manifest, ManifestState, Album, Config } from "./Types";

const PATH_PREFIX = import.meta.env.DEV ? "/src/assets" : "./assets";
const DEFAULT_MANIFEST_URI = `${PATH_PREFIX}/manifest.json`;

export const ManifestContext = createContext<Manifest>();

interface ManifestProviderProps {
  children: any;
}

export const ManifestProvider: Component<ManifestProviderProps> = (props) => {
  const [state, setState] = createSignal<ManifestState>(ManifestState.Loading);
  const [config, setConfig] = createSignal<Config>({});
  const [albums, setAlbums] = createSignal<Album[]>([]);
  const [manifest, setManifest] = createSignal<Manifest>({
    albums,
    config,
    state,
  });
  const urlParams = new URLSearchParams(window.location.search);
  const updateManifest = () => setManifest({ albums, config, state });
  const manifestUri = urlParams.get("manifest") || DEFAULT_MANIFEST_URI;
  fetch(manifestUri)
    .then(async (response) => {
      const manifest = await response.json();
      if (!manifest.config.absoluteTrackUris) {
        _.each(manifest.albums, (album) => {
          _.each(album.tracks, (track) => {
            track.uri = `${PATH_PREFIX}/${track.uri}`;
          });
        });
      }
      setState(
        !manifest.albums.length ? ManifestState.Invalid : ManifestState.Loaded
      );
      setConfig(manifest.config);
      setAlbums(manifest.albums);
      updateManifest();
    })
    .catch((err) => {
      console.error(err);
      setState(ManifestState.Missing);
      updateManifest();
    });
  return (
    <ManifestContext.Provider value={manifest()}>
      {props.children}
    </ManifestContext.Provider>
  );
};

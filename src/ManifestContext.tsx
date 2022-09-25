import _ from "lodash";
import { createContext, Component, createSignal } from "solid-js";
import { Manifest, ManifestState, Album, Config } from "./Types";

const RELATIVE_TRACK_URI_PATH_PREFIX = import.meta.env.DEV
  ? "/src/assets"
  : "./assets";
const DEFAULT_MANIFEST_URI = `${RELATIVE_TRACK_URI_PATH_PREFIX}/manifest.json`;

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
  const singleAlbum = urlParams.get("single_album");
  fetch(manifestUri)
    .then(async (response) => {
      const manifest = await response.json();
      _.each(manifest.albums, (album) => {
        _.each(album.tracks, (track) => {
          if (manifest.config.trackUris === "absolute") {
            track.uri = manifest.config.trackUriRoot
              ? `${manifest.config.trackUriRoot}/${track.uri}`
              : track.uri;
          } else {
            track.uri = `${RELATIVE_TRACK_URI_PATH_PREFIX}/${track.uri}`;
          }
        });
      });
      if (singleAlbum) {
        manifest.albums = _.filter(
          manifest.albums,
          (album) => album.name.toLowerCase() === singleAlbum.toLowerCase()
        );
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

import _ from "lodash";
import { createContext, Component, createSignal } from "solid-js";
import { Manifest, Album, Config } from "./Types";

const PATH_PREFIX = import.meta.env.DEV ? "/src/assets" : "./assets";
const MANIFEST_URI = `${PATH_PREFIX}/manifest.json`;

export const ManifestContext = createContext<Manifest>();

interface ManifestProviderProps {
  children: any;
}

export const ManifestProvider: Component<ManifestProviderProps> = (props) => {
  const [config, setConfig] = createSignal<Config>({});
  const [albums, setAlbums] = createSignal<Album[]>([]);
  const [manifest, setManifest] = createSignal<Manifest>({
    albums,
    config,
  });
  fetch(MANIFEST_URI).then(async (response) => {
    const manifest = await response.json();
    _.each(manifest.albums, (album) => {
      _.each(album.tracks, (track) => {
        track.uri = `${PATH_PREFIX}/${track.uri}`;
      });
    });
    setConfig(manifest.config);
    setAlbums(manifest.albums);
    setManifest({ albums, config });
  });
  return (
    <ManifestContext.Provider value={manifest()}>
      {props.children}
    </ManifestContext.Provider>
  );
};

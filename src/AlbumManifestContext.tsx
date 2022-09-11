import _ from "lodash";
import { createContext, Component, createSignal } from "solid-js";
import { AlbumManifest, Album } from "./Types";

const PATH_PREFIX = import.meta.env.DEV ? "/src/assets" : "./assets";
const MANIFEST_URI = `${PATH_PREFIX}/manifest.json`;

export const AlbumManifestContext = createContext<AlbumManifest>();

interface AlbumManifestProviderProps {
  children: any;
}

export const AlbumManifestProvider: Component<AlbumManifestProviderProps> = (
  props
) => {
  const [config, setConfig] = createSignal<Record<string, any>>({});
  const [albums, setAlbums] = createSignal<Album[]>([]);
  const [manifest, setManifest] = createSignal<AlbumManifest>({
    albums,
    config,
  });
  fetch(MANIFEST_URI).then(async (response) => {
    const albumManifest = await response.json();
    _.each(albumManifest.albums, (album) => {
      _.each(album.tracks, (track) => {
        track.uri = `${PATH_PREFIX}/${track.uri}`;
      });
    });
    setConfig(albumManifest.config);
    setAlbums(albumManifest.albums);
    setManifest({ albums, config });
  });
  return (
    <AlbumManifestContext.Provider value={manifest()}>
      {props.children}
    </AlbumManifestContext.Provider>
  );
};

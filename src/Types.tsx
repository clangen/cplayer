import { Accessor } from "solid-js";

export interface Track {
  title: string;
  uri: string;
  tags: string[];
}

export interface Album {
  name: string;
  artist: string;
  tracks: Track[];
}

export enum PlaybackState {
  Stopped = "stopped",
  Buffering = "buffering",
  Playing = "playing",
  Paused = "paused",
}

export enum ManifestState {
  Loading = "loading",
  Missing = "missing",
  Invalid = "invalid",
  Loaded = "loaded",
}

export enum RepeatMode {
  None = "none",
  Track = "track",
  Album = "album",
  All = "all",
}

export enum TrackEndType {
  Manual = "manual",
  Natural = "natural",
}

export interface CurrentTrack {
  album: Album;
  track: Track;
  index: number;
}

export interface Config {
  pageTitle?: string;
  hideDownloadButton?: boolean;
  absoluteTrackUris?: boolean;
}

export interface Playback {
  state: Accessor<PlaybackState>;
  current: Accessor<CurrentTrack | undefined>;
  duration: Accessor<number>;
  position: Accessor<number>;
  volume: Accessor<number>;
  setVolume: (volume: number) => void;
  repeatMode: Accessor<RepeatMode>;
  setRepeatMode: (mode: RepeatMode) => void;
  play: (album: Album, index: number) => void;
  seekTo: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
}

export interface Manifest {
  albums: Accessor<Album[]>;
  config: Accessor<Config>;
  state: Accessor<ManifestState>;
}

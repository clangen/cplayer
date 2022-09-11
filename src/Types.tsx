import { Accessor } from "solid-js";

export interface Track {
  title: string;
  uri: string;
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

export interface CurrentTrack {
  album: Album;
  track: Track;
  index: number;
}

export interface Playback {
  state: Accessor<PlaybackState>;
  current: Accessor<CurrentTrack | undefined>;
  duration: Accessor<number>;
  position: Accessor<number>;
  volume: Accessor<number>;
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
  config: Accessor<Record<string, any>>;
}

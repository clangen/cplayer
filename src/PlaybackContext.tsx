import _ from "lodash";
import {
  createContext,
  Component,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import { ManifestContext } from "./ManifestContext";
import { Playback, PlaybackState, Album, CurrentTrack } from "./Types";

export const PlaybackContext = createContext<Playback>();

interface PlaybackProviderProps {
  children: any;
}

const player = new Audio();

export const PlaybackProvider: Component<PlaybackProviderProps> = (props) => {
  const [state, setState] = createSignal(PlaybackState.Stopped);
  const [current, setCurrent] = createSignal<CurrentTrack | undefined>();
  const [duration, setDuration] = createSignal(0);
  const [position, setPosition] = createSignal(0);
  const [volume, setVolume] = createSignal(0);
  const manifest = useContext(ManifestContext);

  const getAdjacentAlbum = (offset: number) => {
    const currentAlbum = current()?.album.name;
    let currentAlbumIndex = -1;
    if (currentAlbum) {
      currentAlbumIndex =
        _.findIndex(
          manifest?.albums() || [],
          (el) => el.name === currentAlbum
        ) + offset;
    }
    return currentAlbumIndex < 0 ? null : manifest?.albums()[currentAlbumIndex];
  };

  const stop = () => {
    setCurrent(undefined);
    setState(PlaybackState.Stopped);
    player.pause();
  };

  const play = (album: Album, index: number) => {
    stop();
    const track = album.tracks[index];
    setCurrent({ album, track, index });
    setState(PlaybackState.Buffering);
    setDuration(0);
    setPosition(0);
    player.src = track.uri;
    player.play();
  };

  const playPrevAlbum = () => {
    const prevAlbum = getAdjacentAlbum(-1);
    if (prevAlbum) {
      play(prevAlbum, prevAlbum.tracks.length - 1);
    }
  };

  const playNextAlbum = () => {
    const nextAlbum = getAdjacentAlbum(1);
    if (nextAlbum) {
      play(nextAlbum, 0);
    }
  };

  const pause = () => {
    setState(PlaybackState.Paused);
    player.pause();
  };

  const next = () => {
    const playing = current();
    if (playing) {
      const album = playing.album;
      const nextIndex = playing.index + 1;
      if (nextIndex < playing.album.tracks.length) {
        play(album, nextIndex);
      } else {
        playNextAlbum();
      }
    }
  };

  const prev = () => {
    const playing = current();
    if (playing) {
      if (player.currentTime > 4.0) {
        play(playing.album, playing.index);
      } else {
        const album = playing.album;
        const preIndex = playing.index - 1;
        if (preIndex >= 0) {
          play(album, preIndex);
        } else {
          playPrevAlbum();
        }
      }
    }
  };

  const resume = () => {
    if (state() !== PlaybackState.Stopped) {
      player.play();
      setState(PlaybackState.Playing);
    }
  };

  const seekTo = (seconds: number) => {
    player.fastSeek ? player.fastSeek(seconds) : (player.currentTime = seconds);
  };

  const service: Playback = {
    state,
    current,
    position,
    duration,
    volume,
    play,
    seekTo,
    pause,
    resume,
    next,
    prev,
    stop,
  };

  onMount(() => {
    player.addEventListener("play", () => {
      setState(PlaybackState.Playing);
    });
    player.addEventListener("error", () => {
      stop();
    });
    player.addEventListener("timeupdate", () => {
      setDuration(player.duration);
      setPosition(player.currentTime);
      setVolume(player.volume);
    });
    player.addEventListener("ended", () => {
      next();
    });
  });

  return (
    <PlaybackContext.Provider value={service}>
      {props.children}
    </PlaybackContext.Provider>
  );
};

import _ from "lodash";
import { createContext, Component, createSignal, onMount } from "solid-js";
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

  const service: Playback = {
    state,
    current,
    position,
    duration,
    volume,
    play,
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
  });

  return (
    <PlaybackContext.Provider value={service}>
      {props.children}
    </PlaybackContext.Provider>
  );
};

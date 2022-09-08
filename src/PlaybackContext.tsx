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
    console.log(player);
  };

  const pause = () => {
    setState(PlaybackState.Paused);
    player.pause();
  };

  const next = () => {
    stop();
  };

  const prev = () => {
    stop();
  };

  const service: Playback = {
    state,
    current,
    position,
    duration,
    volume,
    play,
    pause,
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
      console.log(position());
      setVolume(player.volume);
    });
  });

  return (
    <PlaybackContext.Provider value={service}>
      {props.children}
    </PlaybackContext.Provider>
  );
};

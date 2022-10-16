import _ from "lodash";
import {
  createContext,
  Component,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import { ManifestContext } from "./ManifestContext";
import {
  Playback,
  PlaybackState,
  Album,
  CurrentTrack,
  TrackEndType,
  RepeatMode,
} from "./Types";

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
  const [repeatMode, setRepeatMode] = createSignal(RepeatMode.None);
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

  const next = (endType: TrackEndType = TrackEndType.Manual) => {
    const playing = current();
    if (playing && manifest) {
      const repeatTrack =
        endType === TrackEndType.Natural && repeatMode() === RepeatMode.Track;
      if (repeatTrack) {
        play(playing?.album, playing?.index);
      } else {
        const albums = manifest?.albums();
        const nextIndex = playing.index + 1;
        const playNextInAlbum = nextIndex < playing.album.tracks.length;
        const album = playing.album;
        const isLastTrackInAlbum =
          playing?.album.tracks.length - 1 === playing?.index;
        const restartAlbum =
          repeatMode() === RepeatMode.Album && isLastTrackInAlbum;
        const restartAll =
          repeatMode() === RepeatMode.All &&
          playing?.album === albums[albums.length - 1] &&
          isLastTrackInAlbum;
        if (playNextInAlbum) {
          play(album, nextIndex);
        } else if (restartAll) {
          play(albums[0], 0);
        } else if (restartAlbum) {
          play(album, 0);
        } else {
          playNextAlbum();
        }
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
        const albums = manifest?.albums() || [];
        const preIndex = playing.index - 1;
        const isFirstAlbum = album === albums[0];
        const playEndOfAlbum =
          repeatMode() === RepeatMode.Album && playing.index === 0;
        const playEndOfList = repeatMode() === RepeatMode.All && isFirstAlbum;
        if (playEndOfAlbum) {
          play(album, album.tracks.length - 1);
        } else if (playEndOfList) {
          if (albums.length) {
            const lastAlbum = albums[albums.length - 1];
            play(lastAlbum, lastAlbum.tracks.length - 1);
          }
        } else if (preIndex >= 0) {
          play(album, preIndex);
        } else {
          if (isFirstAlbum) {
            play(album, playing.index);
          } else {
            playPrevAlbum();
          }
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
    setVolume,
    repeatMode,
    setRepeatMode,
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
      next(TrackEndType.Natural);
    });
  });

  return (
    <PlaybackContext.Provider value={service}>
      {props.children}
    </PlaybackContext.Provider>
  );
};

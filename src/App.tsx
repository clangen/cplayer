import _ from "lodash";
import {
  Component,
  Show,
  useContext,
  createEffect,
  createSignal,
  onMount,
  onCleanup,
} from "solid-js";
import {
  Track,
  Album,
  Playback,
  Manifest,
  PlaybackState,
  ManifestState,
  RepeatMode,
} from "./Types";
import { PlaybackContext } from "./PlaybackContext";
import { ManifestContext } from "./ManifestContext";
import styles from "./App.module.css";

interface TrackViewProps {
  album: Album;
  track: Track;
  index: number;
}

interface AlbumViewProps {
  album: Album;
}

interface TransportButtonProps {
  onClick: () => void;
  caption: string;
  extendedStyles?: string | string[];
}

interface SeekBarProps {
  percent: number;
  onChange?: (percent: number) => void;
  extendedStyles?: string | string[];
}

const mergeExtendedStyles = (
  baseStyle: string,
  extendedStyles?: string | string[]
) => {
  return _.compact([
    baseStyle,
    ...(_.isArray(extendedStyles) ? extendedStyles : [extendedStyles]),
  ]).join(" ");
};

const formatDuration = (seconds: number) => {
  if (!seconds) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds - mins * 60;
  return `${Math.floor(mins)}:${Math.floor(secs).toString().padStart(2, "0")}`;
};

const handleConfigChanged = (config: Record<string, any>) => {
  const pageTitle = config.pageTitle;
  if (pageTitle) {
    document.title = pageTitle;
  }
};

const handleDocumentKeyPress = (
  ev: any,
  manifest: Manifest,
  playback: Playback
) => {
  if (ev.charCode === 32) {
    switch (playback?.state() ?? PlaybackState.Stopped) {
      case PlaybackState.Stopped: {
        const albums = manifest?.albums() || [];
        if (albums.length) {
          playback?.play(albums[0], 0);
        }
        break;
      }
      case PlaybackState.Paused: {
        playback?.resume();
        break;
      }
      default: {
        playback?.pause();
        break;
      }
    }
  }
};

const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

const SeekBar: Component<SeekBarProps> = (props) => {
  const mergedStyles = () =>
    mergeExtendedStyles(styles.SeekBarContainer, props.extendedStyles);
  let elementRef: HTMLDivElement | undefined;
  const [mouseMoveX, setMouseMoveX] = createSignal<number | undefined>(
    undefined
  );
  const percent = () => {
    const x = mouseMoveX() ?? -1;
    if (elementRef && x >= 0) {
      const relX = x - elementRef.offsetLeft;
      const width = elementRef.clientWidth;
      const percent = clamp((relX / width) * 100, 0, 100);
      return percent;
    }
    return props.percent;
  };
  const handleDocumentMouseUp = (ev: any) => {
    const x = mouseMoveX() ?? -1;
    if (elementRef && x >= 0) {
      props.onChange?.(percent());
    }
    setMouseMoveX(undefined);
  };
  const handleMouseDown = (ev: any) => {
    if (ev.button === 0) {
      setMouseMoveX(ev.screenX);
    }
  };
  const handleMouseMove = (ev: any) => {
    const x = mouseMoveX() ?? -1;
    if (x >= 0 && elementRef) {
      setMouseMoveX(ev.screenX);
    }
  };
  onMount(() => {
    document.addEventListener("mouseup", handleDocumentMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
  });
  onCleanup(() => {
    document.removeEventListener("mouseup", handleDocumentMouseUp);
    document.removeEventListener("mousemove", handleMouseMove);
  });
  return (
    <div ref={elementRef} onMouseDown={handleMouseDown} class={mergedStyles()}>
      <div class={styles.SeekBar} style={{ width: `${percent()}%` }} />
    </div>
  );
};

const TrackView: Component<TrackViewProps> = (props) => {
  const playback = useContext(PlaybackContext);
  const manifest = useContext(ManifestContext);

  const showDownloadButton = () => {
    if (!_.isNil(manifest?.config().hideDownloadButton)) {
      return !manifest?.config().hideDownloadButton;
    }
    return false;
  };

  const style = () =>
    playback?.current()?.index === props.index &&
    playback?.current()?.album.name === props.album.name
      ? styles.AlbumTrackPlaying
      : "";

  const handleClick = () => {
    playback?.play(props.album, props.index);
  };

  return (
    <div onClick={handleClick} class={`${styles.AlbumTrack} ${style()}`}>
      <div class={styles.TrackNumber}>
        <div>{props.index + 1}</div>
      </div>
      <div class={styles.Flex1}>
        <div class={styles.TrackTitleRow}>
          <div class={styles.TrackTitle}>{props.track.title}</div>
          {props.track.tags.map((tag) => (
            <div class={styles.TrackTag}>{tag}</div>
          ))}
        </div>
        <Show when={showDownloadButton()}>
          <a class={styles.TrackUri} href={props.track.uri}>
            download
          </a>
        </Show>
      </div>
    </div>
  );
};

const TransportButton: Component<TransportButtonProps> = (props) => {
  const mergeStyles = () =>
    mergeExtendedStyles(styles.TransportButton, props.extendedStyles);
  return (
    <div onClick={props.onClick} class={mergeStyles()}>
      <div class={styles.TransportButtonInner}>{props.caption}</div>
    </div>
  );
};

const TransportTitle: Component = () => {
  const playback = useContext(PlaybackContext);
  const state = () => playback?.state() ?? PlaybackState.Stopped;
  const title = () => playback?.current()?.track.title ?? "[unknown]";
  const album = () => playback?.current()?.album.name ?? "[unknown]";
  const artist = () => playback?.current()?.album.artist ?? "[uknown]";
  const stopped = () => state() === PlaybackState.Stopped;
  const buffering = () => state() === PlaybackState.Buffering;
  const active = () => !stopped() && !buffering();
  return (
    <div class={styles.TransportTrackTitle}>
      <Show when={stopped()}>
        <div>not playing</div>
      </Show>
      <Show when={buffering()}>
        <div>buffering...</div>
      </Show>
      <Show when={active()}>
        <div class={styles.TransportTrackSeparator}>now playing</div>
        <div class={styles.TransportTrackMetadata}>{title()}</div>
        <div class={styles.TransportTrackSeparator}>by</div>
        <div class={styles.TransportTrackMetadata}>{artist()}</div>
        <div class={styles.TransportTrackSeparator}>from</div>
        <div class={styles.TransportTrackMetadata}>{album()}</div>
      </Show>
    </div>
  );
};

const RepeatModeButton: Component = () => {
  const playback = useContext(PlaybackContext);
  const handleToggleRepeat = () => {
    const ordering = _.values(RepeatMode);
    const i = _.indexOf(ordering, playback?.repeatMode() ?? RepeatMode.None);
    const rotated = ordering[(i + 1) % ordering.length];
    playback?.setRepeatMode(rotated);
  };
  return (
    <div class={styles.RepeatButtonContainer}>
      <TransportButton
        caption={`repeat ${playback?.repeatMode()}`}
        onClick={handleToggleRepeat}
        extendedStyles={styles.RepeatButton}
      />
    </div>
  );
};

const VolumeSeekBar: Component = () => {
  const playback = useContext(PlaybackContext);
  const currentVolume = () => (playback?.volume() || 1) * 100;
  const handleChanged = (percent: number) => {
    playback?.setVolume(percent / 100);
  };
  return (
    <div class={styles.VolumeSeekBarContainer}>
      <div>volume</div>
      <SeekBar
        percent={currentVolume()}
        onChange={handleChanged}
        extendedStyles={[styles.VolumeSeekBar]}
      />
    </div>
  );
};

const TransportView: Component = () => {
  const manifest = useContext(ManifestContext);
  const albums = () => manifest?.albums() || [];
  const playback = useContext(PlaybackContext);
  const playhead = () => {
    const pos = playback?.position() ?? 0;
    const dur = playback?.duration() ?? 0;
    return dur === 0 ? 0 : (pos / dur) * 100;
  };
  const playPauseCaption = () => {
    const state = playback?.state() || PlaybackState.Stopped;
    if (state === PlaybackState.Paused) {
      return "unpause";
    }
    return state === PlaybackState.Stopped ? "play" : "pause";
  };
  const handlePlayPause = () => {
    const state = playback?.state() || PlaybackState.Stopped;
    switch (state) {
      case PlaybackState.Stopped:
        playback?.play(albums()[0], 0);
        break;
      case PlaybackState.Playing:
        playback?.pause();
        break;
      case PlaybackState.Paused:
        playback?.resume();
        break;
    }
  };
  const handlePrev = () => {
    playback?.prev();
  };
  const handleNext = () => {
    playback?.next();
  };
  const handleTimeSeek = (percent: number) => {
    const dur = playback?.duration() ?? 0;
    if (dur) {
      const pos = dur * (percent / 100);
      playback?.seekTo(pos);
    }
  };
  const volumeSeekBarStyle = [
    styles.HideIfTooSmall,
    styles.TransportButtonSpacer,
  ].join(" ");
  return (
    <div class={styles.Transport}>
      <TransportTitle />
      <div class={styles.TransportTimeContainer}>
        <div class={styles.TransportDuration}>{`${formatDuration(
          playback?.position() ?? 0
        )}`}</div>
        <SeekBar percent={playhead()} onChange={handleTimeSeek} />
        <div class={styles.TransportDuration}>{`${formatDuration(
          playback?.duration() ?? 0
        )}`}</div>
      </div>
      <div class={styles.TransportButtonContainer}>
        <div class={volumeSeekBarStyle}>
          <VolumeSeekBar />
        </div>
        <div class={styles.TransportNavigationButtonContainer}>
          <TransportButton onClick={handlePrev} caption="prev" />
          <TransportButton
            onClick={handlePlayPause}
            caption={playPauseCaption()}
          />
          <TransportButton onClick={handleNext} caption="next" />
        </div>
        <div class={styles.TransportButtonSpacer}>
          <RepeatModeButton />
        </div>
      </div>
    </div>
  );
};

const AlbumView: Component<AlbumViewProps> = (props) => {
  return (
    <div class={styles.Album}>
      <div class={styles.AlbumTitleContainer}>
        <div class={styles.AlbumTitle}>{props.album.name}</div>
        <div>by</div>
        <div class={styles.AlbumTitle}>{props.album.artist}</div>
      </div>
      <div>
        {_.map(props.album.tracks, (track, index) => (
          <TrackView album={props.album} track={track} index={index} />
        ))}
      </div>
    </div>
  );
};

const App: Component = () => {
  const playback = useContext(PlaybackContext);
  const manifest = useContext(ManifestContext);

  const manifestError = () =>
    manifest?.state() === ManifestState.Invalid ||
    manifest?.state() === ManifestState.Missing;

  const manifestLoaded = () => manifest?.state() === ManifestState.Loaded;

  const handleKeyPress = (ev: any) =>
    handleDocumentKeyPress(ev, manifest!, playback!);

  onMount(() => document.addEventListener("keypress", handleKeyPress));

  onCleanup(() => document.removeEventListener("keypress", handleKeyPress));

  createEffect(() => {
    handleConfigChanged(manifest?.config() ?? {});
  }, [manifest?.config]);

  return (
    <div class={styles.App}>
      <Show when={manifestLoaded()}>
        <div class={styles.MainContent}>
          <div class={styles.AlbumList}>
            {_.map(manifest?.albums(), (album) => (
              <AlbumView album={album} />
            ))}
          </div>
          <TransportView />
        </div>
      </Show>
      <Show when={manifestError()}>
        <div>invalid, corrupted, or empty manifest file!</div>
      </Show>
    </div>
  );
};

export default App;

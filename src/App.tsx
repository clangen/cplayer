import _ from "lodash";
import { Component, useContext } from "solid-js";
import AlbumManifest from "./AlbumManifest";
import { Track, Album, PlaybackState } from "./Types";
import { PlaybackContext } from "./PlaybackContext";
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
}

const formatDuration = (seconds: number) => {
  if (!seconds) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds - mins * 60;
  return `${Math.round(mins)}:${Math.round(secs).toString().padStart(2, "0")}`;
};

const TrackView: Component<TrackViewProps> = (props) => {
  const playbackContext = useContext(PlaybackContext);

  const style = () =>
    playbackContext?.current()?.index === props.index &&
    playbackContext?.current()?.album.name === props.album.name
      ? styles.AlbumTrackPlaying
      : "";

  const handleClick = () => {
    playbackContext?.play(props.album, props.index);
  };

  return (
    <div onClick={handleClick} class={`${styles.AlbumTrack} ${style()}`}>
      <div class={styles.TrackNumber}>
        <div>{props.index + 1}</div>
      </div>
      <div>
        <div class={styles.TrackTitle}>{props.track.title}</div>
        <a class={styles.TrackUri} href={props.track.uri}>
          download
        </a>
      </div>
    </div>
  );
};

const TransportButton: Component<TransportButtonProps> = (props) => {
  return (
    <div onClick={props.onClick} class={styles.TransportButton}>
      {props.caption}
    </div>
  );
};

const TransportView: Component = () => {
  const playbackContext = useContext(PlaybackContext);
  const playhead = () => {
    const pos = playbackContext?.position() ?? 0;
    const dur = playbackContext?.duration() ?? 0;
    return `${dur === 0 ? 0 : (pos / dur) * 100}%`;
  };
  const playPauseCaption = () => {
    const state = playbackContext?.state() || PlaybackState.Stopped;
    if (state === PlaybackState.Paused) {
      return "unpause";
    }
    return state === PlaybackState.Stopped ? "play" : "pause";
  };
  const handlePlayPause = () => {
    const state = playbackContext?.state() || PlaybackState.Stopped;
    switch (state) {
      case PlaybackState.Stopped:
        playbackContext?.play(AlbumManifest[0], 0);
        break;
      case PlaybackState.Playing:
        playbackContext?.pause();
        break;
      case PlaybackState.Paused:
        playbackContext?.resume();
        break;
    }
  };
  const handlePrev = () => {
    playbackContext?.prev();
  };
  const handleNext = () => {
    playbackContext?.next();
  };
  return (
    <div class={styles.Transport}>
      <div class={styles.TransportTrackTitle}>
        {playbackContext?.current()?.track.title ?? "not playing"}
      </div>
      <div class={styles.TransportTimeContainer}>
        <div class={styles.TransportDuration}>{`${formatDuration(
          playbackContext?.position() ?? 0
        )}`}</div>
        <div class={styles.TransportSeekBarContainer}>
          <div class={styles.TransportSeekBar} style={{ width: playhead() }} />
        </div>
        <div class={styles.TransportDuration}>{`${formatDuration(
          playbackContext?.duration() ?? 0
        )}`}</div>
      </div>
      <div class={styles.TransportButtonContainer}>
        <TransportButton onClick={handlePrev} caption="prev" />
        <TransportButton
          onClick={handlePlayPause}
          caption={playPauseCaption()}
        />
        <TransportButton onClick={handleNext} caption="next" />
      </div>
    </div>
  );
};

const AlbumView: Component<AlbumViewProps> = (props) => {
  return (
    <div class={styles.Album}>
      <div class={styles.AlbumTitle}>{props.album.name}</div>
      <div>
        {_.map(props.album.tracks, (track, index) => (
          <TrackView album={props.album} track={track} index={index} />
        ))}
      </div>
    </div>
  );
};

const App: Component = () => {
  return (
    <div class={styles.App}>
      <div class={styles.MainContent}>
        <div class={styles.AlbumList}>
          {_.map(AlbumManifest, (album) => (
            <AlbumView album={album} />
          ))}
        </div>
        <TransportView />
      </div>
    </div>
  );
};

export default App;

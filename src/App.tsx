import _ from "lodash";
import { Accessor, Component, useContext } from "solid-js";
import ALBUMS from "./Albums";
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
          {props.track.uri}
        </a>
      </div>
    </div>
  );
};

const TransportPrevButton: Component = () => (
  <div
    onClick={() => {
      const playbackContext = useContext(PlaybackContext);
      playbackContext?.prev();
    }}
    class={styles.TransportButton}
  >
    prev
  </div>
);

const TransportNextButton: Component = () => (
  <div
    onClick={() => {
      const playbackContext = useContext(PlaybackContext);
      playbackContext?.prev();
    }}
    class={styles.TransportButton}
  >
    next
  </div>
);

const TransportPlayButton: Component = () => {
  const playbackContext = useContext(PlaybackContext);
  return (
    <div
      onClick={() => {
        playbackContext?.stop();
      }}
      class={styles.TransportButton}
    >
      {playbackContext?.state() === PlaybackState.Stopped ? "play" : "pause"}
    </div>
  );
};

const TransportView: Component = () => {
  const playbackContext = useContext(PlaybackContext);
  return (
    <div class={styles.Transport}>
      <div class={styles.TransportTrackTitle}>
        {playbackContext?.current()?.track.title ?? "not playing"}
      </div>
      <div class={styles.TransportTimeContainer}>
        <div>{` pos: ${playbackContext?.position() ?? 0}`}</div>
        <div class={styles.TransportSeekBar} />
        <div>{` dur: ${playbackContext?.duration() ?? 0}`}</div>
      </div>
      <div class={styles.TransportButtonContainer}>
        <TransportPrevButton />
        <TransportPlayButton />
        <TransportNextButton />
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
          {_.map(ALBUMS, (album) => (
            <AlbumView album={album} />
          ))}
        </div>
        <TransportView />
      </div>
    </div>
  );
};

export default App;

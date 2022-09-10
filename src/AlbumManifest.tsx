const PATH_PREFIX = import.meta.env.DEV
  ? "/src/assets/albums"
  : "./assets/albums";

const Hustle = {
  name: "the beachside hustle",
  artist: "suncrash",
  tracks: [
    {
      title: "crosstown throwdown",
      uri: `${PATH_PREFIX}/the_beachside_hustle/01-crosstown_throwdown.opus`,
    },
    {
      title: "oleander",
      uri: `${PATH_PREFIX}/the_beachside_hustle/02-oleander.opus`,
    },
    {
      title: "over/under",
      uri: `${PATH_PREFIX}/the_beachside_hustle/03-over_under.opus`,
    },
    {
      title: "road to santa fe",
      uri: `${PATH_PREFIX}/the_beachside_hustle/04-road_to_santa_fe.opus`,
    },
    {
      title: "up empty",
      uri: `${PATH_PREFIX}/the_beachside_hustle/05-up_empty.opus`,
    },
  ],
};

const Disaster = {
  name: "immediate disaster",
  artist: "suncrash",
  tracks: [
    {
      title: "rise and shine",
      uri: `${PATH_PREFIX}/immediate_disaster/01-rise_and_shine.opus`,
    },
    {
      title: "listless days",
      uri: `${PATH_PREFIX}/immediate_disaster/02-listless_days.opus`,
    },
    {
      title: "heads up",
      uri: `${PATH_PREFIX}/immediate_disaster/03-heads_up.opus`,
    },
    {
      title: "backroads",
      uri: `${PATH_PREFIX}/immediate_disaster/04-backroads.opus`,
    },
    {
      title: "flyback",
      uri: `${PATH_PREFIX}/immediate_disaster/05-flyback.opus`,
    },
    {
      title: "downtown slalom",
      uri: `${PATH_PREFIX}/immediate_disaster/06-downtown_slalom.opus`,
    },
    {
      title: "surf dirty",
      uri: `${PATH_PREFIX}/immediate_disaster/07-surf_dirty.opus`,
    },
    {
      title: "southbound blues",
      uri: `${PATH_PREFIX}/immediate_disaster/08-southbound_blues.opus`,
    },
    {
      title: "insert coin",
      uri: `${PATH_PREFIX}/immediate_disaster/09-insert_coin.opus`,
    },
    {
      title: "summer's purge",
      uri: `${PATH_PREFIX}/immediate_disaster/10-summers_purge.opus`,
    },
    {
      title: "send help",
      uri: `${PATH_PREFIX}/immediate_disaster/11-send_help.opus`,
    },
    {
      title: "roundabout",
      uri: `${PATH_PREFIX}/immediate_disaster/12-roundabout.opus`,
    },
    {
      title: "2am tumble",
      uri: `${PATH_PREFIX}/immediate_disaster/13-2am_tumble.opus`,
    },
    {
      title: "signoff",
      uri: `${PATH_PREFIX}/immediate_disaster/99-signoff.opus`,
    },
  ],
};

export default [Hustle, Disaster];

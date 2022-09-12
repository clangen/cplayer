# Overview

`cplayer` is a small, statically served, client-side album-based audio player for modern web browsers. You simply drop a build into a directory on your web server, create a `manifest.json` file that describes the album metadata and track URIs and you're done.

It looks something like this:

![cplayer screenshot](/doc/img/screenshot.png)

# Why?

I recorded some music and wanted to share it with a couple other people, but didn't want to bother creating a SoundCloud account, upload them to YouTube, or send them via email. I just wanted to host my own music and provide a simple, lightweight web-based player for others to use to listen to the audio.

# Usage

1. Download a release, and extract it to a directory on your web server.
2. Create a `manifest.json` file in the `assets/` subdirectory. This is a simple JSON file that contains:
   - A list of `albums` and their respective tracks
   - An optional `config` structure to tweak the runtime behavior of the player.
   - [An example `manifest.json` can be found here](src/assets/manifest-example.json). Fields should be self-explanatory.
3. You're done! Load the page and you should be good to go.

# Modifying, building

`cplayer` is easy to build, all you need is a working `NodeJS` installation and `yarn`.

1. Clone the repository
2. `cd cplayer`
3. `yarn`
4. `yarn dev` # starts the development server with hot reload on `http://localhost:3000`
5. `yarn build` # creates a static build in the `dist/` subdirectory

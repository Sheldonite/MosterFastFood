# Desktop EXE Build

The desktop app is an Electron shell around the existing HTML/canvas game. Multiplayer still uses the Node WebSocket server at `/coop`, but desktop clients should connect to a hosted or LAN server instead of `location.host`.

## Run The Web Server

```sh
npm start
```

This starts the local web and WebSocket server at:

```text
http://localhost:4173
ws://localhost:4173/coop
```

## Run The Desktop App In Development

Install dependencies once:

```sh
npm install
```

Run the Electron app:

```sh
npm run desktop
```

For local multiplayer testing, start `npm start` in another terminal and use this server URL in the multiplayer menu:

```text
ws://localhost:4173
```

For hosted multiplayer, use the public secure URL:

```text
wss://your-game-server.example.com
```

You can also launch the desktop app with a default server URL:

```sh
BOSS_FIGHT_SERVER_URL=wss://your-game-server.example.com npm run desktop
```

## Build Windows EXE

```sh
npm run dist:win
```

The installer is written under `dist/`.

## Auto Updates

The desktop app uses `electron-updater` and checks GitHub Releases for this repository:

```text
Sheldonite/MosterFastFood
```

Auto-update checks run only from packaged builds, not from `npm run desktop`.

Release flow:

1. Update the version in `package.json`, for example `0.1.0` to `0.1.1`.
2. Build the installer:

```sh
npm run dist:win
```

3. Create a GitHub Release whose tag matches the version:

```text
v0.1.1
```

4. Upload these generated files from `dist/` to the release:

```text
Boss-Fight-Setup-0.1.1.exe
Boss-Fight-Setup-0.1.1.exe.blockmap
latest.yml
```

Existing installed EXEs will see the release, download the installer, and ask the player to restart.

For command-line publishing with `electron-builder`, set a GitHub token that has release upload access:

```sh
set GH_TOKEN=your_token_here
npm run publish:win
```

## Server Deployment

Deploy `server.js` as the multiplayer service. It already reads `process.env.PORT`, so most hosts can run it with:

```sh
npm start
```

Use one always-on instance while rooms are stored in memory. If the server restarts, active rooms disappear and connected players disconnect.

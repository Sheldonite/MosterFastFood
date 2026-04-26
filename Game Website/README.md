# Boss Fight

## Starting Locally

Windows:

```text
Double-click start.bat
```

If Node.js is missing and `winget` is available, `start.bat` will ask whether to install Node.js LTS. Choose `Y` only if you want Windows to download and install Node.js from the standard package source.

macOS/Linux:

```sh
chmod +x start.sh
./start.sh
```

Then open:

```text
http://localhost:4173
```

The launchers try Node.js first, then Python. If neither is installed, Windows opens `index.html` directly as a fallback.

## Character Sprite

Place the player spritesheet at:

```text
assets/player-spritesheet.png
```

The game expects a 4 column by 4 row PNG:

```text
row 1: walk down
row 2: walk left
row 3: walk right
row 4: walk up
```

If the file is missing, the game falls back to the simple canvas-drawn character.

## Curly Fries Sprite

Place the Curly Fries boss spritesheet at:

```text
assets/curly-fries-spritesheet.png
```

The game expects a 4 column by 3 row PNG:

```text
row 1: idle
row 2: french fry machine gun
row 3: curly fry launch
```

If the file is missing, Curly Fries falls back to the simple canvas-drawn boss.

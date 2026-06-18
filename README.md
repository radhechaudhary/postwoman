# Postwoman 🚀
Fed up with Postman ? check this out.
A lightweight, cross-platform desktop API testing tool — built with modern web tech and shipped as a native app via Tauri.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | [Tauri v2](https://tauri.app/) (Rust-powered) |
| UI Framework | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Build Tool | [Vite 7](https://vitejs.dev/) |
| HTTP Client | [@tauri-apps/plugin-http](https://github.com/tauri-apps/plugins-workspace) + Axios |
| Icons | [Lucide React](https://lucide.dev/) |

---

## Features

- Send HTTP requests (GET, POST, PUT, DELETE, PATCH, etc.)
- Set custom headers and request bodies
- View formatted responses with status codes
- Native desktop experience — no browser, no Electron overhead
- Fast cold-start thanks to Tauri's Rust backend
- Clean, minimal UI built with Tailwind CSS

---

## Prerequisites

Make sure you have the following installed before getting started:

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Tauri CLI prerequisites](https://tauri.app/start/prerequisites/) for your OS

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/radhechaudhary/postwoman.git
cd postwoman
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run tauri dev
```

This starts Vite's dev server and launches the native desktop window with hot-reload enabled.

---

## Building for Production

```bash
npm run tauri build
```

Tauri will compile the Rust backend and bundle the frontend into a platform-native installer (`.dmg` on macOS, `.msi`/`.exe` on Windows, `.AppImage`/`.deb` on Linux). Output artifacts are placed in `src-tauri/target/release/bundle/`.

---

## Project Structure

```
postwoman/
├── public/             # Static assets
├── src/                # React frontend source
├── src-tauri/          # Tauri (Rust) backend & config
│   └── tauri.conf.json # App configuration
├── index.html          # Entry HTML
├── vite.config.js      # Vite configuration
└── package.json
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (browser only) |
| `npm run tauri dev` | Launch full Tauri app in dev mode |
| `npm run tauri build` | Build native desktop app |

---

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) with the following extensions:

- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---
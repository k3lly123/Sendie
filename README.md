# Dispatcher Hub & Shipping Workbench

A high-performance merchant shipping dashboard, custom-built with React, TypeScript, Tailwind CSS, and Framer Motion (`motion`). Features comprehensive package creation channels, detailed real-time logistics logs, beautiful visual statistics, and responsive sandbox-safe event systems with automated toast notifications.

---

## 🛠️ Prerequisites

Before you start, make sure you have the following software installed on your computer:

1. **Node.js**: Recommended LTS versions (e.g., **v18.x** or **v20.x** or later). 
   - [Download Node.js](https://nodejs.org/)
2. **Package Manager**: `npm` comes bundled automatically with Node.js.
3. **Code Editor**: **Visual Studio Code (VS Code)** is highly recommended.
   - [Download VS Code](https://code.visualstudio.com/)

---

## 🚀 Local Setup Instructions

Follow these clear, sequential steps to configure and run the software locally on your PC:

### Step 1: Open the Project in VS Code
1. Export or extract the project files to a clean workspace directory on your drive (e.g., `C:\Projects\shipping-hub`).
2. Open **VS Code**.
3. Go to the menu bar: Select **File ➔ Open Folder...** (or `Ctrl+K Ctrl+O` on Windows / `Cmd+O` on macOS).
4. Navigate to your project folder and select it to load the workspace.

### Step 2: Open terminal in VS Code
Open the integrated VS Code terminal by doing **one** of the following:
- Use the keyboard shortcut: **``Ctrl+```** (Control + Backtick)
- Go to the menu bar: Select **Terminal ➔ New Terminal**

### Step 3: Install Project Dependencies
Run the install command to configure your local `node_modules` structure automatically from the manifest:
```bash
npm install
```
This builds and hooks all dependencies, including **React 19**, **Vite**, **Tailwind CSS v4**, and **Framer Motion**.

### Step 4: Environment Variables Setup
If you need live integrations or custom variables loaded, copy `.env.example` as a template for your local environment configuration:
```bash
cp .env.example .env
```
*(On Windows Command Prompt, use `copy .env.example .env`)*

Open the newly created `.env` file in VS Code and fill in the values as necessary:
- `GEMINI_API_KEY`: If using server proxy features.
- `APP_URL`: Configure to `http://localhost:3000` for sandbox loopbacks.

---

## 💻 Running the Application

### Development Server
To launch the hot-reloading development server locally, run:
```bash
npm run dev
```

The system will build the bundle and spin up. Vite is configured to host on port `3000`. You can access it by opening your browser to:
👉 **[http://localhost:3000](http://localhost:3000)**

*(Changes you make in the source files will reflect instantaneously in your browser).*

### Building for Production
To compile and optimize your bundle for a production distribution (e.g., static hosting, AWS, Netlify, or Vercel):
```bash
npm run build
```
This command generates an ultra-fast, lightweight static set of assets inside the newly compiled `/dist` directory.

### Preview Production Build
To test how your compiled production build behaves locally:
```bash
npm run preview
```

---

## 🧩 Recommended VS Code Extensions

To unlock peak developer productivity, live syntax validation, and visual suggestions inside VS Code, we recommend installing the following free extensions from the marketplace:

1. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Highlights and autocompletes responsive utility patterns directly in your JSX files.
2. **ESLint** (`dbaeumer.vscode-eslint`)
   - Catches syntax issues and styling discrepancies on-the-fly.
3. **Prettier - Code Formatter** (`esbenp.prettier-vscode`)
   - Formats your code beautifully on save matching clean industry spacing standards.

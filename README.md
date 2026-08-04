# Haven · 栖境

Haven is a quiet, immersive collection of places designed to offer a gentle pause from everyday life. Choose a place, enter its atmosphere, and simply stay for a while.

## Framework

- [Next.js](https://nextjs.org/) 16
- React 19
- TypeScript

## Local development

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Production build

```bash
npm run build
npm run start
```

`npm run build` creates the optimized Next.js production output in `.next/`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel will detect the **Next.js** framework automatically.
4. Keep the default build command: `npm run build`.
5. Deploy.

No environment variables are required for the current version.

## Git hygiene

Generated files and local machine files—including `node_modules`, `.next`, `.vercel`, build outputs, logs, and `.DS_Store`—are excluded by `.gitignore`. Commit the source code, `public/` assets, `package.json`, and `package-lock.json`.

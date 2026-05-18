# Luxe Interiors Frontend

This is a React + Vite frontend for the Luxe Interiors project.

## Getting Started

Install dependencies:

```bash
cd "c:\Development\interior design frontend"
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Environment Variables

The project uses Vite environment variables for runtime configuration.

Copy `.env.example` to `.env` and update values as needed.

```bash
cp .env.example .env
```

### Supported variables

- `VITE_API_BASE_URL`
  - Backend API URL used by the app
  - Defaults to `https://backend-three-phi-64.vercel.app/api` if not set
- `VITE_CLOUDINARY_CLOUD_NAME`
  - Cloudinary cloud name for image uploads
- `VITE_CLOUDINARY_UPLOAD_PRESET`
  - Cloudinary upload preset for image uploads

> Do not commit `.env` to GitHub. It is already ignored by `.gitignore`.

## Deployment to Vercel

The repository includes `vercel.json` for static deployment.

### Recommended Vercel settings

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Development Command: `npm run dev`

### Vercel environment variables

Set the same keys in the Vercel dashboard if you need custom values:

- `VITE_API_BASE_URL`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

## Notes

- The app uses `vercel.json` to route all client-side paths to `index.html`.
- If the backend URL is unchanged, you do not need to set `VITE_API_BASE_URL`.
- Keep actual credentials out of version control.

## Useful Commands

```bash
npm run dev
npm run build
npm run preview
```

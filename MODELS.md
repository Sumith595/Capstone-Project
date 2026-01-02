# Hosting face-api.js models locally

Place the face-api.js model weights under `public/models` so the app can load them from `/models`.

Quick automatic download (Windows PowerShell):

1. From the project root run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\download_faceapi_models.ps1
```

2. Start the dev server (`npm run dev`) and the models will be served from `/models`.

Notes
 
CDN fallback
- If local model files are not present under `public/models`, the app will automatically fall back to loading the models from a CDN (jsDelivr). This is an acceptable option if you prefer not to store large binary files in the repo.
- If you have any zero-byte or partial files in `public/models`, delete them to ensure the loader correctly falls back to the CDN.

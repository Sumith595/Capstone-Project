/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_FACE_API: string
  readonly VITE_FACE_MODEL_PATH?: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
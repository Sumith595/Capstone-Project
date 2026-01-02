# Download face-api.js models into public/models
# Run from the project root in PowerShell (Windows)

$targetDir = "public/models"
if (-not (Test-Path $targetDir)) {
  New-Item -ItemType Directory -Path $targetDir | Out-Null
}

$base = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights"
$files = @(
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1.bin",
  "face_expression_model-weights_manifest.json",
  "face_expression_model-shard1.bin"
)

foreach ($f in $files) {
  $url = "$base/$f"
  $out = Join-Path $targetDir $f
  Write-Host "Downloading $url -> $out"
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
  } catch {
    Write-Warning "Failed to download $url : $_"
  }
}

Write-Host "Done. Models are in $targetDir"

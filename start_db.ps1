$mongoPath = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
$dataDir = "$PSScriptRoot\mongodb_data"

if (-not (Test-Path $mongoPath)) {
    Write-Host "❌ Error: Create not find mongod.exe at $mongoPath" -ForegroundColor Red
    Write-Host "Please install MongoDB or check the path."
    exit 1
}

if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
    Write-Host "Created data directory at $dataDir" -ForegroundColor Green
}

Write-Host "🚀 Starting MongoDB..." -ForegroundColor Cyan
Write-Host "Database Path: $dataDir"

& $mongoPath --dbpath $dataDir --port 27017

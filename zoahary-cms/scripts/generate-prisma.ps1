# PowerShell helper to run Prisma generate while ignoring missing checksum (useful for transient CDN errors)
# Usage: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\generate-prisma.ps1

$env:PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = '1'
Write-Host "Running prisma generate with PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 ..."
prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Error "prisma generate failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "prisma generate completed."

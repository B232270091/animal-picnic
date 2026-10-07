$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$picnicNode = Join-Path $PSScriptRoot '..\.tools\node-v22.22.0-win-x64\node.exe'
if (Test-Path -LiteralPath $picnicNode) {
    $env:PATH = (Split-Path $picnicNode) + ';' + $env:PATH
    & $picnicNode 'node_modules/vite/bin/vite.js' --host 127.0.0.1 --port 5173
} else {
    npm run dev
}

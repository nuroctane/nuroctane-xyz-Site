# Create or refresh the quotes pipeline's own Python environment.
#
# The scheduled pipeline used to borrow Hermes' venv. Hermes moved to a bundled
# runtime on 2026-10-09 and deleted that venv, which silently dropped the task
# onto the no-ingest fallback for ten days. This venv lives outside Hermes so a
# Hermes upgrade can never take it away again.
#
#   powershell -File scripts/install-quotes-venv.ps1

$ErrorActionPreference = 'Stop'

$venv = Join-Path $env:LOCALAPPDATA 'nuroctane\quotes-venv'
$uv = Join-Path $env:LOCALAPPDATA 'hermes\bin\uv.exe'
if (-not (Test-Path $uv)) { $uv = (Get-Command uv -ErrorAction Stop).Source }

New-Item -ItemType Directory -Force (Split-Path $venv) | Out-Null
& $uv venv --python 3.12 --allow-existing $venv
if ($LASTEXITCODE) { exit $LASTEXITCODE }

$py = Join-Path $venv 'Scripts\python.exe'
# Semantic classifier (quote_semantic.py) + image handling (quote_image_ocr.py).
# Windows OCR itself shells out to SnipOCR's venv when winrt is absent here.
& $uv pip install --python $py numpy onnxruntime tokenizers pillow
if ($LASTEXITCODE) { exit $LASTEXITCODE }

& $py -c "import numpy, onnxruntime, tokenizers, PIL; print('quotes venv ready:', __import__('sys').executable)"
exit $LASTEXITCODE

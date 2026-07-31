#Requires -Version 5.1
<#
.SYNOPSIS
  Windows entrypoint for the Obsidian quotes + books poller.

  Scheduled Task "NuroctanePollSync" runs this every 15 minutes.
  The bash poller always syncs quotes (Obsidian -> repo), periodically
  pulls remote books.md updates, then mirrors books.md into the Obsidian
  Book Wishlist (repo -> vault).
#>
$ErrorActionPreference = 'Stop'
$RepoRoot = 'C:\Users\david\Laboratory\nuroctane.xyz'
$Bash = @(
  'C:\Program Files\Git\bin\bash.exe',
  'C:\Program Files\Git\usr\bin\bash.exe'
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $Bash) {
  throw 'Git Bash not found. Install Git for Windows.'
}

$LogDir = Join-Path $RepoRoot '.nur'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Log = Join-Path $LogDir 'poll-sync.log'

function Write-Log([string]$msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
  Add-Content -LiteralPath $Log -Value $line
  Write-Host $line
}

Set-Location -LiteralPath $RepoRoot
$env:HOME = $env:USERPROFILE
# Keep PATH git-aware for commit/push inside the shell script.
$env:PATH = "C:\Program Files\Git\cmd;C:\Program Files\Git\bin;$env:PATH"

Write-Log 'poll-sync start'
try {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $Bash
  $psi.Arguments = '-lc ./scripts/poll-sync.sh'
  $psi.WorkingDirectory = $RepoRoot
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true
  $psi.Environment['HOME'] = $env:USERPROFILE
  $p = [System.Diagnostics.Process]::Start($psi)
  $stdout = $p.StandardOutput.ReadToEnd()
  $stderr = $p.StandardError.ReadToEnd()
  $p.WaitForExit()
  if ($stdout) { Add-Content -LiteralPath $Log -Value $stdout.TrimEnd() }
  if ($stderr) { Add-Content -LiteralPath $Log -Value ("STDERR: " + $stderr.TrimEnd()) }
  if ($p.ExitCode -ne 0) {
    Write-Log "poll-sync FAILED exit=$($p.ExitCode)"
    exit $p.ExitCode
  }
  Write-Log 'poll-sync ok'
  exit 0
} catch {
  Write-Log ("poll-sync exception: " + $_.Exception.Message)
  exit 1
}

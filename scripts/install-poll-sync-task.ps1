#Requires -Version 5.1
<#
.SYNOPSIS
  Install / refresh the Windows Scheduled Task that runs Obsidian quotes sync.

  Task name: NuroctanePollSync
  Schedule: every 15 minutes (quotes sync is cheap; books pull stays 90-min gated)
#>
$ErrorActionPreference = 'Stop'
$TaskName = 'NuroctanePollSync'
$RepoRoot = 'C:\Users\david\Laboratory\nuroctane.xyz'
$Script = Join-Path $RepoRoot 'scripts\poll-sync.ps1'

if (-not (Test-Path -LiteralPath $Script)) {
  throw "Missing $Script"
}

$action = New-ScheduledTaskAction `
  -Execute 'powershell.exe' `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Script`"" `
  -WorkingDirectory $RepoRoot

# Indefinite repetition: start once, repeat every 15 min for ~10 years
# (TimeSpan.MaxValue is rejected by Task Scheduler XML).
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes 15) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2)

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

Write-Host "Installed Scheduled Task '$TaskName' (every 15 min)"
Write-Host "  script: $Script"
Write-Host "  log:    $RepoRoot\.nur\poll-sync.log"
Write-Host "Run once now:  Start-ScheduledTask -TaskName $TaskName"

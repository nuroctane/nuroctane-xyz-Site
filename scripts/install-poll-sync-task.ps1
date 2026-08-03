#Requires -Version 5.1
<#
.SYNOPSIS
  Install / refresh the Windows Scheduled Task that runs the Raindrop-first
  quotes pipeline (Raindrop #quotes -> Obsidian -> site -> main).

  Task name: NuroctanePollSync
  Schedule: every 15 minutes

  Launches via wscript + poll-sync.vbs so no console window ever appears
  (powershell.exe as the task action still flashes a cmd even with -WindowStyle Hidden).
#>
$ErrorActionPreference = 'Stop'
$TaskName = 'NuroctanePollSync'
$RepoRoot = 'C:\Users\david\Laboratory\nuroctane.xyz'
$Vbs = Join-Path $RepoRoot 'scripts\poll-sync.vbs'

if (-not (Test-Path -LiteralPath $Vbs)) {
  throw "Missing $Vbs"
}

$wscript = Join-Path $env:SystemRoot 'System32\wscript.exe'
$action = New-ScheduledTaskAction `
  -Execute $wscript `
  -Argument "//B //Nologo `"$Vbs`"" `
  -WorkingDirectory $RepoRoot

# Indefinite repetition: start once, repeat every 15 min for ~10 years
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes 15) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
  -Hidden

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

Write-Host "Installed Scheduled Task '$TaskName' (every 15 min, silent wscript)"
Write-Host "  launcher: $Vbs"
Write-Host "  log:      $RepoRoot\.nur\quotes-pipeline.log"
Write-Host "Run once now:  Start-ScheduledTask -TaskName $TaskName"

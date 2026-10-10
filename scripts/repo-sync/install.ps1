#Requires -Version 5.1
<#
.SYNOPSIS
  Installs, refreshes or removes the RepoSync scheduled task, which keeps this
  PC's clones fast-forwarded to whatever was pushed to GitHub from elsewhere,
  invisibly, whenever you're signed in.

.DESCRIPTION
  Copies sync.ps1 and launch.js to %LOCALAPPDATA%\RepoSync (so checking out
  another branch here never changes the running copy), writes config.json
  there, and registers the per-user task "RepoSync". No admin rights needed.

  The task runs at sign-in, on unlock, on wake from sleep and every
  IntervalMinutes while you're signed in. It runs once right away and the
  installer prints what it found.

  Re-running is safe: it refreshes the scripts and keeps your earlier
  settings unless you pass new ones.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File install.ps1
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File install.ps1 -Root C:\Users\david\Laboratory, D:\Code
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File install.ps1 -Uninstall
#>
[CmdletBinding()]
param(
  # Folders whose immediate subfolders are git clones. Default: %USERPROFILE%\Laboratory.
  [string[]]$Root,
  # GitHub owners whose repos are synced. Default: nuroctane.
  [string[]]$Owner,
  [ValidateRange(5, 720)]
  [int]$IntervalMinutes,
  # Log problems only, never show a Windows notification.
  [switch]$NoNotify,
  # Don't pick up new versions of sync.ps1 from this clone's origin/main.
  [switch]$NoSelfUpdate,
  [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'
$TaskName = 'RepoSync'
$InstallDir = Join-Path $env:LOCALAPPDATA 'RepoSync'
$ConfigPath = Join-Path $InstallDir 'config.json'

if ($Uninstall) {
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  }
  if (Test-Path -LiteralPath $InstallDir) { Remove-Item -LiteralPath $InstallDir -Recurse -Force }
  Write-Host "Removed the $TaskName task and $InstallDir. Your repositories were not touched."
  return
}

$existing = $null
if (Test-Path -LiteralPath $ConfigPath) {
  try { $existing = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json } catch { }
}
function Get-Saved([string]$Name, $Default) {
  if ($existing -and $existing.PSObject.Properties.Name -contains $Name) { return $existing.$Name }
  return $Default
}

$roots = @(if ($Root) { $Root } else { Get-Saved 'roots' (Join-Path $env:USERPROFILE 'Laboratory') })
$owners = @(if ($Owner) { $Owner } else { Get-Saved 'owners' 'nuroctane' })
$interval = if ($IntervalMinutes) { $IntervalMinutes } else { [int](Get-Saved 'intervalMinutes' 10) }
$notify = if ($PSBoundParameters.ContainsKey('NoNotify')) { -not $NoNotify } else { [bool](Get-Saved 'notify' $true) }
$repos = @(Get-Saved 'repos' @() | Where-Object { $_ })

$roots = @($roots | ForEach-Object {
  if (Test-Path -LiteralPath $_ -PathType Container) { (Resolve-Path -LiteralPath $_).Path }
  else { Write-Warning "Folder not found, kept anyway: $_"; $_ }
})

$git = Get-Command git.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $git) { throw 'git.exe is not on PATH. Install Git for Windows first.' }

function Invoke-GitText([string[]]$GitArgs) {
  # Windows PowerShell turns a native command's stderr into an error under 'Stop'.
  $ErrorActionPreference = 'Continue'
  $out = & $git.Path @GitArgs 2>$null
  if ($LASTEXITCODE -ne 0) { return $null }
  return (($out | Out-String).Trim())
}

# Self-update follows origin/main of the clone this installer runs from.
$selfUpdate = $null
$wantSelfUpdate = if ($PSBoundParameters.ContainsKey('NoSelfUpdate')) { -not $NoSelfUpdate } else { (Get-Saved 'selfUpdate' $true) -ne $false }
if ($wantSelfUpdate) {
  $top = Invoke-GitText @('-C', $PSScriptRoot, 'rev-parse', '--show-toplevel')
  $prefix = Invoke-GitText @('-C', $PSScriptRoot, 'rev-parse', '--show-prefix')
  if ($top -and $prefix) {
    $ownerPattern = '(?i)github\.com(:443)?[:/]+(' + (($owners | ForEach-Object { [regex]::Escape($_) }) -join '|') + ')/'
    $remote = $null
    foreach ($line in ((Invoke-GitText @('-C', $top, 'config', '--get-regexp', '^remote\..*\.url$')) -split "`r?`n")) {
      if ($line -match '^remote\.(.+)\.url\s+(.+)$' -and $Matches[2] -match $ownerPattern) {
        $name = $Matches[1]
        if (-not $remote -or $name -eq 'origin') { $remote = $name }
      }
    }
    if ($remote) {
      $selfUpdate = [ordered]@{
        repo = (Resolve-Path -LiteralPath $top).Path
        ref  = "refs/remotes/$remote/main"
        path = $prefix.TrimEnd('/')
      }
    }
  }
  if (-not $selfUpdate) { Write-Warning 'Self-update is off: run install.ps1 from inside a clone of nuroctane.xyz to turn it on.' }
}

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
foreach ($file in 'sync.ps1', 'launch.js', 'install.ps1') {
  $target = Join-Path $InstallDir $file
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $target -Force
  Unblock-File -LiteralPath $target
}
# A fresh install clears any update the old copy was trying out or had refused.
foreach ($stale in 'self-update.json', 'sync.ps1.prev', 'sync.ps1.new') {
  Remove-Item -LiteralPath (Join-Path $InstallDir $stale) -Force -ErrorAction SilentlyContinue
}

$config = [ordered]@{
  roots           = $roots
  repos           = $repos
  owners          = $owners
  intervalMinutes = $interval
  notify          = $notify
  git             = $git.Path
  selfUpdate      = $(if ($selfUpdate) { $selfUpdate } elseif ($wantSelfUpdate) { $null } else { $false })
}
[IO.File]::WriteAllText($ConfigPath, ($config | ConvertTo-Json -Depth 4), (New-Object Text.UTF8Encoding $false))

$user = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$wscript = Join-Path $env:SystemRoot 'System32\wscript.exe'
$launcher = Join-Path $InstallDir 'launch.js'
$action = New-ScheduledTaskAction -Execute $wscript -Argument "//B //Nologo //E:JScript `"$launcher`"" -WorkingDirectory $InstallDir

$every = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes $interval) `
  -RepetitionDuration (New-TimeSpan -Days 3650)
$logon = New-ScheduledTaskTrigger -AtLogOn -User $user
$logon.Delay = 'PT1M'
$triggers = @($every, $logon)

try {
  $ns = 'ROOT\Microsoft\Windows\TaskScheduler'
  $unlock = New-CimInstance -ClientOnly -CimClass (Get-CimClass -Namespace $ns -ClassName MSFT_TaskSessionStateChangeTrigger) -Property @{
    StateChange = [uint32]8   # TASK_SESSION_UNLOCK
    UserId      = $user
    Delay       = 'PT30S'
    Enabled     = $true
  }
  $wake = New-CimInstance -ClientOnly -CimClass (Get-CimClass -Namespace $ns -ClassName MSFT_TaskEventTrigger) -Property @{
    Subscription = "<QueryList><Query Id=`"0`" Path=`"System`"><Select Path=`"System`">*[System[Provider[@Name='Microsoft-Windows-Power-Troubleshooter'] and EventID=1]]</Select></Query></QueryList>"
    Delay        = 'PT1M'
    Enabled      = $true
  }
  $triggers += @($unlock, $wake)
} catch {
  Write-Warning "Unlock and wake triggers unavailable ($($_.Exception.Message)); sign-in and every $interval min still apply."
}

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
  -Priority 7
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName `
  -Description "Fast-forwards the GitHub clones under $($roots -join ', ') to what was pushed from elsewhere. Pull-only; never merges, resets or pushes. Installed from scripts\repo-sync; files in $InstallDir." `
  -Action $action -Trigger $triggers -Settings $settings -Principal $principal -Force | Out-Null

Write-Host "Installed the '$TaskName' task: at sign-in, unlock, wake and every $interval min, no window."
Write-Host "  roots:  $($roots -join ', ')"
Write-Host "  owners: $($owners -join ', ')"
if ($selfUpdate) { Write-Host "  self-update: sync.ps1 from $($selfUpdate.ref -replace '^refs/remotes/', '') in $($selfUpdate.repo)" }
Write-Host 'Running it once now (fetching every repo can take a minute)...'

$statusPath = Join-Path $InstallDir 'status.json'
$logPath = Join-Path $InstallDir 'sync.log'
$started = Get-Date
Start-ScheduledTask -TaskName $TaskName
# Wait until this run has started and finished: the task can sit in Queued or
# Ready for a moment before it shows as Running.
$deadline = $started.AddMinutes(5)
do {
  Start-Sleep -Seconds 2
  $info = Get-ScheduledTaskInfo -TaskName $TaskName
  $ran = $info.LastRunTime -ge $started.AddSeconds(-5)
  $running = (Get-ScheduledTask -TaskName $TaskName).State -eq 'Running'
} while ((-not $ran -or $running) -and (Get-Date) -lt $deadline)

$status = $null
if ((Test-Path -LiteralPath $statusPath) -and (Get-Item -LiteralPath $statusPath).LastWriteTime -ge $started.AddSeconds(-5)) {
  try { $status = Get-Content -LiteralPath $statusPath -Raw | ConvertFrom-Json } catch { }
}
if (-not $status) {
  if ($running) { Write-Warning 'The first run is still going after 5 minutes.' }
  else { Write-Warning "The first run ended without a report (task result $($info.LastTaskResult))." }
  if (Test-Path -LiteralPath $logPath) {
    Write-Host 'Last lines of the log:'
    Get-Content -LiteralPath $logPath -Tail 15 | ForEach-Object { Write-Host "  $_" }
  }
  Write-Host "To see a run in this window: powershell -NoProfile -ExecutionPolicy Bypass -File `"$(Join-Path $InstallDir 'sync.ps1')`""
  return
}

Write-Host ''
$status.repos | ForEach-Object {
  [pscustomobject]@{
    Repo    = $_.repo
    Branch  = $_.head
    State   = $_.state
    Fetch   = $_.fetch
    Changes = (@($_.changes) -join '; ')
  }
} | Format-Table -AutoSize -Wrap | Out-String | Write-Host

if (@($status.attention).Count) {
  Write-Host 'Needs you:' -ForegroundColor Yellow
  $status.attention | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "Log: $(Join-Path $InstallDir 'sync.log')   Status: $statusPath"
Write-Host "Remove: powershell -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Uninstall"

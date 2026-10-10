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

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
foreach ($file in 'sync.ps1', 'launch.js') {
  $target = Join-Path $InstallDir $file
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $target -Force
  Unblock-File -LiteralPath $target
}

$config = [ordered]@{
  roots           = $roots
  repos           = $repos
  owners          = $owners
  intervalMinutes = $interval
  notify          = $notify
  git             = $git.Path
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
Write-Host 'Running it once now...'

Start-ScheduledTask -TaskName $TaskName
$deadline = (Get-Date).AddMinutes(5)
Start-Sleep -Seconds 2
while ((Get-ScheduledTask -TaskName $TaskName).State -eq 'Running' -and (Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 2
}

$statusPath = Join-Path $InstallDir 'status.json'
$status = $null
if (Test-Path -LiteralPath $statusPath) {
  try { $status = Get-Content -LiteralPath $statusPath -Raw | ConvertFrom-Json } catch { }
}
if (-not $status) {
  $info = Get-ScheduledTaskInfo -TaskName $TaskName
  Write-Warning "The first run hasn't reported yet (last result $($info.LastTaskResult)). Check $(Join-Path $InstallDir 'sync.log')."
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

#Requires -Version 5.1
<#
.SYNOPSIS
  Brings this PC's clones up to date with what was pushed to GitHub from
  elsewhere: cloud Claude sessions, the Tunerz admin console, another machine.

.DESCRIPTION
  Pull-only and fast-forward-only. It never merges, rebases, stashes, resets,
  deletes a branch or pushes, so it cannot lose local work.

  For every repository directly under each configured root (or listed in
  config.json "repos") whose remote points at one of the configured GitHub
  owners:
    1. fetch that remote with --prune, so cloud branches (origin/claude/*) appear;
    2. fast-forward the checked-out branch to its upstream. Git itself refuses
       when an uncommitted or untracked file is in the way, and then nothing moves;
    3. fast-forward every other local branch that is strictly behind its
       upstream and not checked out in any worktree.
  A branch with no upstream set follows the same-named branch on that remote.
  Hooks are off for these commands, so a background pull never runs a
  project's post-merge install or database push.

  What it can't do safely is logged, kept in status.json and, once it has
  lasted GraceMinutes, raised as one Windows notification: the checked-out
  branch diverged or blocked by local changes, a merge or rebase in progress,
  a stale index.lock, or a fetch that fails for a reason other than being
  offline (expired sign-in, deleted repo).

  install.ps1 copies this file to %LOCALAPPDATA%\RepoSync and schedules it;
  launch.js runs it with no window.
#>
[CmdletBinding()]
param(
  [string]$ConfigPath = (Join-Path $PSScriptRoot 'config.json'),
  [string]$DataDir = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'

$IsWindowsHost = ($env:OS -eq 'Windows_NT')
$LogPath = Join-Path $DataDir 'sync.log'
$StatePath = Join-Path $DataDir 'state.json'
$StatusPath = Join-Path $DataDir 'status.json'
$NoHooksDir = Join-Path $DataDir 'no-hooks'
$GraceMinutes = 30
$StaleLockMinutes = 60
$OfflinePattern = '(?i)could not resolve host|temporary failure in name resolution|failed to connect|couldn''t connect|connection (was )?(timed out|refused|reset|aborted)|timed out|network is unreachable|no route to host'
$DependencyFiles = '(^|/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|requirements[^/]*\.txt|pyproject\.toml|uv\.lock|poetry\.lock|Cargo\.lock|go\.sum|Gemfile\.lock)$'

# Background git must never wait on a prompt nobody can see.
$env:GIT_TERMINAL_PROMPT = '0'
$env:GCM_INTERACTIVE = 'never'
$env:GIT_MERGE_AUTOEDIT = 'no'
foreach ($name in 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE') {
  Remove-Item -LiteralPath "env:$name" -ErrorAction SilentlyContinue
}

function Write-Log([string]$Message) {
  $line = '{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
  try {
    if ((Test-Path -LiteralPath $LogPath) -and (Get-Item -LiteralPath $LogPath).Length -gt 1MB) {
      Move-Item -LiteralPath $LogPath -Destination "$LogPath.1" -Force
    }
    Add-Content -LiteralPath $LogPath -Value $line -Encoding UTF8
  } catch { }
  Write-Host $line
}

function Get-UnixNow { [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() }

function Read-JsonFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  try { return (Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json) } catch { return $null }
}

function Write-JsonFile([string]$Path, $Value) {
  $json = $Value | ConvertTo-Json -Depth 8
  [IO.File]::WriteAllText($Path, $json, (New-Object Text.UTF8Encoding $false))
}

function ConvertTo-ArgumentString([string[]]$Items) {
  $quoted = foreach ($item in $Items) {
    if ($item -ne '' -and $item -notmatch '[\s"]') { $item }
    else { '"' + (($item -replace '(\\*)"', '$1$1\"') -replace '(\\+)$', '$1$1') + '"' }
  }
  $quoted -join ' '
}

function Stop-ProcessTree($Process) {
  if ($IsWindowsHost) {
    & (Join-Path $env:SystemRoot 'System32\taskkill.exe') /PID $Process.Id /T /F *> $null
  }
  try { $Process.Kill() } catch { }
}

function Invoke-Git([string]$Repo, [string[]]$Arguments, [int]$TimeoutSeconds = 60) {
  $hooks = $NoHooksDir -replace '\\', '/'
  $all = @(
    '-c', "core.hooksPath=$hooks",
    '-c', 'merge.autoStash=false',
    '-c', 'submodule.recurse=false',
    '-c', 'fetch.recurseSubmodules=false',
    '-c', 'gc.auto=0',
    '-c', 'maintenance.auto=false'
  ) + $Arguments
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $script:Git
  $psi.Arguments = ConvertTo-ArgumentString $all
  $psi.WorkingDirectory = $Repo
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true
  # Redirected stdin and stderr also make Git for Windows answer its
  # "Unlink of file failed. Should I try again?" question with no at once.
  $psi.RedirectStandardInput = $true
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.StandardOutputEncoding = [Text.Encoding]::UTF8
  $psi.StandardErrorEncoding = [Text.Encoding]::UTF8
  $p = [System.Diagnostics.Process]::Start($psi)
  $p.StandardInput.Close()
  $out = $p.StandardOutput.ReadToEndAsync()
  $err = $p.StandardError.ReadToEndAsync()
  if (-not $p.WaitForExit($TimeoutSeconds * 1000)) {
    Stop-ProcessTree $p
    return [pscustomobject]@{ Ok = $false; Code = -1; Out = ''; Err = "timed out after $TimeoutSeconds s" }
  }
  $p.WaitForExit()
  [pscustomobject]@{
    Ok   = ($p.ExitCode -eq 0)
    Code = $p.ExitCode
    Out  = $out.Result.TrimEnd()
    Err  = $err.Result.Trim()
  }
}

function Get-Lines([string]$Text) {
  if (-not $Text) { return @() }
  @($Text -split "`r?`n" | Where-Object { $_ -ne '' })
}

function Get-FirstLine([string]$Text) {
  $lines = @(Get-Lines $Text | Where-Object { $_ -notmatch '^\s*hint:' })
  if ($lines.Count) { return ($lines[0].Trim() -replace '^(fatal|error): ', '') }
  return '(no message)'
}

function Format-Commits([int]$Count) {
  if ($Count -eq 1) { return '1 commit' }
  return "$Count commits"
}

function Resolve-Git([string]$Configured) {
  if ($Configured -and (Test-Path -LiteralPath $Configured)) { return $Configured }
  $cmd = Get-Command git -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($cmd) { return $cmd.Path }
  foreach ($candidate in @("$env:ProgramFiles\Git\cmd\git.exe", "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe")) {
    if (Test-Path -LiteralPath $candidate) { return $candidate }
  }
  return $null
}

function Add-Problem([string]$Key, [string]$Text) {
  $script:Problems[$Key] = $Text
  $script:Attention.Add($Text)
}

function Find-Repos($Roots, $Explicit) {
  $seen = @{}
  $candidates = New-Object System.Collections.Generic.List[string]
  foreach ($root in $Roots) {
    if (-not (Test-Path -LiteralPath $root -PathType Container)) {
      Add-Problem "root|$root" "Folder $root no longer exists; update config.json or re-run install.ps1 -Root."
      continue
    }
    $candidates.Add((Get-Item -LiteralPath $root).FullName)
    foreach ($dir in Get-ChildItem -LiteralPath $root -Directory -Force -ErrorAction SilentlyContinue) {
      $candidates.Add($dir.FullName)
    }
  }
  foreach ($dir in $Explicit) { $candidates.Add([string]$dir) }
  foreach ($dir in $candidates) {
    if (-not $dir) { continue }
    $key = $dir.TrimEnd('\', '/').ToLowerInvariant()
    if ($seen.ContainsKey($key)) { continue }
    $seen[$key] = $true
    # Only a main checkout has a .git directory; linked worktrees (agent
    # workspaces) and submodules have a .git file and are left alone.
    if (Test-Path -LiteralPath (Join-Path $dir '.git') -PathType Container) { $dir }
  }
}

function Get-SyncRemote([string]$Repo) {
  $r = Invoke-Git $Repo @('config', '--get-regexp', '^remote\..*\.url$')
  if (-not $r.Ok) { return $null }
  $hits = @()
  foreach ($line in Get-Lines $r.Out) {
    if ($line -match '^remote\.(.+)\.url\s+(.+)$') {
      $name = $Matches[1]
      $url = $Matches[2]
      if ($url -match $script:OwnerPattern) { $hits += [pscustomobject]@{ Name = $name; Url = $url } }
    }
  }
  if (-not $hits.Count) { return $null }
  $origin = $hits | Where-Object { $_.Name -eq 'origin' } | Select-Object -First 1
  if ($origin) { return $origin }
  return $hits[0]
}

function Get-Relation([string]$Repo, [string]$Local, [string]$Upstream) {
  $behind = Invoke-Git $Repo @('merge-base', '--is-ancestor', $Local, $Upstream)
  if ($behind.Code -eq 0) { return 'behind' }
  if ($behind.Code -ne 1) { return 'unknown' }
  $ahead = Invoke-Git $Repo @('merge-base', '--is-ancestor', $Upstream, $Local)
  if ($ahead.Code -eq 0) { return 'ahead' }
  if ($ahead.Code -ne 1) { return 'unknown' }
  return 'diverged'
}

function Get-CommitCount([string]$Repo, [string]$From, [string]$To) {
  $r = Invoke-Git $Repo @('rev-list', '--count', "$From..$To")
  if ($r.Ok) { return [int]$r.Out }
  return 0
}

function Format-Blocked([string]$Err) {
  $lines = @(Get-Lines $Err)
  $files = @($lines | Where-Object { $_ -match '^\s+\S' } | ForEach-Object { $_.Trim() })
  $shown = ($files | Select-Object -First 3) -join ', '
  if ($files.Count -gt 3) { $shown += " and $($files.Count - 3) more" }
  if ($Err -match 'untracked working tree files would be') { return "untracked files are in the way ($shown)" }
  if ($Err -match 'would be overwritten') { return "uncommitted changes are in the way ($shown)" }
  return Get-FirstLine $Err
}

function Sync-Repo([string]$Repo) {
  $name = Split-Path -Leaf $Repo
  $remote = Get-SyncRemote $Repo
  if (-not $remote) { return $null }

  $result = [ordered]@{
    repo     = $name
    path     = $Repo
    remote   = $remote.Name
    fetch    = 'ok'
    head     = $null
    state    = 'up to date'
    changes  = @()
    branches = [ordered]@{}
  }

  $fetch = Invoke-Git $Repo @('fetch', '--prune', '--quiet', $remote.Name) 180
  if ($fetch.Ok) {
    if ($script:FetchFailing.ContainsKey($Repo)) {
      Write-Log "$name`: fetch works again"
      $script:FetchFailing.Remove($Repo)
    }
  } else {
    $why = Get-FirstLine $fetch.Err
    $result.fetch = "failed: $why"
    if (-not $script:FetchFailing.ContainsKey($Repo)) { Write-Log "$name`: fetch failed: $why" }
    $script:FetchFailing[$Repo] = $true
    if ($fetch.Code -eq -1) {
      Add-Problem "$Repo|fetch" "$name`: fetch hangs (waiting on a sign-in or SSH passphrase?). Run 'git fetch' there once."
    } elseif ($fetch.Err -notmatch $OfflinePattern) {
      Add-Problem "$Repo|fetch" "$name`: can't fetch from GitHub ($why). If it's a sign-in, run 'git fetch' there once."
    }
  }

  $prefix = "refs/remotes/$($remote.Name)/"
  $remoteRefs = @{}
  $r = Invoke-Git $Repo @('for-each-ref', '--format=%(refname)%09%(objectname)', $prefix.TrimEnd('/'))
  foreach ($line in Get-Lines $r.Out) {
    $parts = $line -split "`t"
    if ($parts.Count -ge 2) { $remoteRefs[$parts[0]] = $parts[1] }
  }

  $pending = @()
  $headRef = $null
  $heads = Invoke-Git $Repo @('for-each-ref', '--format=%(refname)%09%(objectname)%09%(HEAD)%09%(upstream)', 'refs/heads')
  foreach ($line in Get-Lines $heads.Out) {
    $parts = $line -split "`t"
    $ref = $parts[0]
    $sha = $parts[1]
    $branch = $ref.Substring('refs/heads/'.Length)
    if ($parts[2] -eq '*') { $headRef = $ref; $result.head = $branch }
    $upstream = if ($parts.Count -ge 4) { $parts[3] } else { '' }
    if (-not $upstream) { $upstream = $prefix + $branch }
    if (-not $upstream.StartsWith($prefix)) { continue }
    if (-not $remoteRefs.ContainsKey($upstream)) { continue }
    $upSha = $remoteRefs[$upstream]
    if ($upSha -eq $sha) { continue }
    $relation = Get-Relation $Repo $sha $upSha
    $result.branches[$branch] = $relation
    if ($relation -eq 'behind' -or $relation -eq 'diverged') {
      $pending += [pscustomobject]@{
        Branch = $branch; Ref = $ref; Sha = $sha; UpSha = $upSha; Relation = $relation
        UpName = $upstream.Substring('refs/remotes/'.Length)
      }
    }
  }
  if (-not $pending.Count) {
    if (@($result.branches.Values) -contains 'ahead') { $result.state = 'ahead (unpushed commits)' }
    return $result
  }

  $checkedOut = @{}
  $worktrees = Invoke-Git $Repo @('worktree', 'list', '--porcelain')
  foreach ($line in Get-Lines $worktrees.Out) {
    if ($line -match '^branch (.+)$') { $checkedOut[$Matches[1]] = $true }
  }
  $gitDir = (Invoke-Git $Repo @('rev-parse', '--absolute-git-dir')).Out.Trim()

  foreach ($b in $pending) {
    $count = Get-CommitCount $Repo $b.Sha $b.UpSha
    $isHead = ($b.Ref -eq $headRef)

    if ($b.Relation -eq 'diverged') {
      if ($isHead) {
        $result.state = 'diverged'
        Add-Problem "$Repo|diverged|$($b.Branch)" "$name`: $($b.Branch) has local commits and $($b.UpName) has $(Format-Commits $count) it doesn't. Pull with rebase or merge by hand."
      }
      continue
    }

    if (-not $isHead) {
      if ($checkedOut.ContainsKey($b.Ref)) { $result.branches[$b.Branch] = 'behind (checked out in another worktree, left alone)'; continue }
      $u = Invoke-Git $Repo @('update-ref', '-m', "repo-sync: fast-forward to $($b.UpName)", $b.Ref, $b.UpSha, $b.Sha)
      if ($u.Ok) {
        $result.branches[$b.Branch] = 'updated'
        $result.changes += "$($b.Branch) +$count"
        Write-Log "$name`: $($b.Branch) fast-forwarded $(Format-Commits $count) to $($b.UpName) ($($b.UpSha.Substring(0, 8)))"
      } else {
        Write-Log "$name`: couldn't fast-forward $($b.Branch): $(Get-FirstLine $u.Err)"
      }
      continue
    }

    $busy = @('MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'BISECT_LOG', 'rebase-merge', 'rebase-apply') |
      Where-Object { Test-Path -LiteralPath (Join-Path $gitDir $_) } | Select-Object -First 1
    if ($busy) {
      $result.state = 'behind (merge/rebase in progress)'
      Add-Problem "$Repo|in-progress|$($b.Branch)" "$name`: $($b.Branch) is $(Format-Commits $count) behind $($b.UpName), skipped while a merge, rebase or bisect is in progress."
      continue
    }
    $lock = Join-Path $gitDir 'index.lock'
    if (Test-Path -LiteralPath $lock) {
      $result.state = 'behind (git busy, next run)'
      $age = ((Get-Date) - (Get-Item -LiteralPath $lock).LastWriteTime).TotalMinutes
      if ($age -gt $StaleLockMinutes) {
        Add-Problem "$Repo|lock" "$name`: .git\index.lock is $([int]$age) min old (a crashed git?). Delete it if no git command is running."
      }
      continue
    }

    $m = Invoke-Git $Repo @('merge', '--ff-only', '--quiet', $b.UpSha) 600
    if ($m.Ok) {
      $result.state = 'updated'
      $result.changes += "$($b.Branch) +$count"
      Write-Log "$name`: $($b.Branch) (checked out) fast-forwarded $(Format-Commits $count) to $($b.UpName) ($($b.UpSha.Substring(0, 8)))"
      $diff = Invoke-Git $Repo @('diff', '--name-only', $b.Sha, $b.UpSha)
      $deps = @(Get-Lines $diff.Out | Where-Object { $_ -match $DependencyFiles })
      if ($deps.Count) {
        $result.changes += "dependencies changed: $($deps -join ', ')"
        Write-Log "$name`: dependency files changed ($($deps -join ', ')); run the install when you next work there"
      }
    } elseif ($m.Err -match 'index\.lock') {
      $result.state = 'behind (git busy, next run)'
    } else {
      $why = Format-Blocked $m.Err
      $result.state = "behind (blocked: $why)"
      Add-Problem "$Repo|blocked|$($b.Branch)" "$name`: $($b.Branch) is $(Format-Commits $count) behind $($b.UpName), but $why."
    }
  }
  return $result
}

function Show-Notification([string]$Title, [string[]]$Lines) {
  $body = ($Lines | Select-Object -First 3) -join "`n"
  if ($Lines.Count -gt 3) { $body += "`n+$($Lines.Count - 3) more in status.json" }
  Write-Log "notify: $Title | $($Lines -join ' | ')"
  if (-not $IsWindowsHost) { return }
  try {
    $null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
    $null = [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime]
    $esc = { param($s) [Security.SecurityElement]::Escape($s) }
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml("<toast><visual><binding template=`"ToastGeneric`"><text>$(& $esc $Title)</text><text>$(& $esc $body)</text><text placement=`"attribution`">$(& $esc $LogPath)</text></binding></visual></toast>")
    $appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
  } catch {
    Write-Log "notification failed: $($_.Exception.Message)"
  }
}

function Read-State {
  $raw = Read-JsonFile $StatePath
  $state = @{ problems = @{}; fetchFailing = @{} }
  if ($raw) {
    if ($raw.problems) {
      foreach ($p in $raw.problems.PSObject.Properties) {
        $state.problems[$p.Name] = @{ firstSeen = [long]$p.Value.firstSeen; notified = [bool]$p.Value.notified }
      }
    }
    if ($raw.fetchFailing) {
      foreach ($p in $raw.fetchFailing) { $state.fetchFailing[[string]$p] = $true }
    }
  }
  return $state
}

function Save-State($State, [hashtable]$Current, [bool]$Notify, [bool]$KeepOthers) {
  $now = Get-UnixNow
  $next = @{}
  if ($KeepOthers) { foreach ($k in $State.problems.Keys) { $next[$k] = $State.problems[$k] } }
  $due = New-Object System.Collections.Generic.List[string]
  foreach ($key in $Current.Keys) {
    $entry = $State.problems[$key]
    if (-not $entry) { $entry = @{ firstSeen = $now; notified = $false } }
    $grace = if ($key -eq 'crash') { 0 } else { $GraceMinutes * 60 }
    if (-not $entry.notified -and ($now - $entry.firstSeen) -ge $grace) {
      $due.Add($Current[$key])
      $entry.notified = $true
    }
    $next[$key] = $entry
  }
  if ($due.Count) {
    if ($Notify) { Show-Notification 'Repo sync needs you' $due.ToArray() }
    else { Write-Log "attention: $($due -join ' | ')" }
  }
  $out = [ordered]@{ problems = [ordered]@{}; fetchFailing = @($State.fetchFailing.Keys) }
  foreach ($k in $next.Keys) { $out.problems[$k] = [ordered]@{ firstSeen = $next[$k].firstSeen; notified = $next[$k].notified } }
  Write-JsonFile $StatePath $out
}

$mutex = New-Object System.Threading.Mutex($false, 'Local\RepoSync')
$owned = $false
try { $owned = $mutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $owned = $true }
if (-not $owned) { exit 0 }

$exitCode = 0
try {
  New-Item -ItemType Directory -Force -Path $DataDir, $NoHooksDir | Out-Null
  $config = Read-JsonFile $ConfigPath
  if (-not $config) { throw "Missing or unreadable config: $ConfigPath (re-run install.ps1)" }
  $roots = @($config.roots | Where-Object { $_ })
  $explicit = @($config.repos | Where-Object { $_ })
  $owners = @($config.owners | Where-Object { $_ })
  if (-not $owners.Count) { throw 'config.json lists no GitHub owners' }
  $notify = -not ($config.PSObject.Properties.Name -contains 'notify' -and -not $config.notify)

  $script:Git = Resolve-Git ([string]$config.git)
  if (-not $script:Git) { throw 'git not found (install Git for Windows or set "git" in config.json)' }
  $script:OwnerPattern = '(?i)github\.com(:443)?[:/]+(' + (($owners | ForEach-Object { [regex]::Escape($_) }) -join '|') + ')/'
  $script:Problems = @{}
  $script:Attention = New-Object System.Collections.Generic.List[string]

  $state = Read-State
  $script:FetchFailing = $state.fetchFailing

  $results = New-Object System.Collections.Generic.List[object]
  foreach ($repo in @(Find-Repos $roots $explicit)) {
    try {
      $r = Sync-Repo $repo
      if ($r) { $results.Add($r) }
    } catch {
      $leaf = Split-Path -Leaf $repo
      Write-Log "$leaf`: error: $($_.Exception.Message)"
      $results.Add([ordered]@{ repo = $leaf; path = $repo; state = "error: $($_.Exception.Message)" })
    }
  }

  # Forget fetch failures for repos that are gone or no longer ours.
  $live = @{}
  foreach ($r in $results) { $live[$r.path] = $true }
  foreach ($k in @($script:FetchFailing.Keys)) { if (-not $live.ContainsKey($k)) { $script:FetchFailing.Remove($k) } }

  Write-JsonFile $StatusPath ([ordered]@{
    lastRun   = (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
    git       = $script:Git
    attention = $script:Attention.ToArray()
    repos     = $results.ToArray()
  })
  Save-State $state $script:Problems $notify $false
  if ($script:Problems.Count) { $exitCode = 1 }
} catch {
  $exitCode = 2
  $message = $_.Exception.Message
  Write-Log "sync failed: $message $($_.ScriptStackTrace -replace '\s+', ' ')"
  try {
    $state = Read-State
    $notifyOnCrash = $true
    $cfg = Read-JsonFile $ConfigPath
    if ($cfg -and $cfg.PSObject.Properties.Name -contains 'notify' -and -not $cfg.notify) { $notifyOnCrash = $false }
    Save-State $state @{ crash = "Repo sync stopped working: $message" } $notifyOnCrash $true
  } catch { }
} finally {
  if ($owned) { $mutex.ReleaseMutex() }
}
exit $exitCode

' Utterly silent launcher for quotes/books poll-sync.
'
' Task Scheduler "Interactive" + powershell.exe still allocates a console and
' can steal focus during games/recordings even with -WindowStyle Hidden.
' wscript.exe is a GUI-subsystem host (no console). .Run(..., 0, True) starts
' the child with SW_HIDE = 0 so nothing appears on screen.
'
' Prefer the repository-owned Raindrop-first quotes pipeline. It launches the
' Hermes parsers with no visible console, but the scheduled contract itself is
' versioned with this site. Its Python is the pipeline's own venv
' (scripts/install-quotes-venv.ps1); Hermes' old venv is a legacy fallback.
' Fall back to the older PowerShell entrypoint (no Raindrop ingest) only when
' neither exists, and say so in the pipeline log so it is not silent.

Option Explicit

Dim fso, sh, hermesPy, pipelineScript, repoRoot, ps1, cmd, rc, logFile

Set fso = CreateObject("Scripting.FileSystemObject")
Set sh  = CreateObject("WScript.Shell")

repoRoot = "C:\Users\david\Laboratory\nuroctane.xyz"
hermesPy = sh.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\nuroctane\quotes-venv\Scripts\python.exe"
If Not fso.FileExists(hermesPy) Then
  hermesPy = "C:\Users\david\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe"
End If
pipelineScript = repoRoot & "\scripts\quotes-pipeline.py"
ps1 = repoRoot & "\scripts\poll-sync.ps1"

If fso.FileExists(hermesPy) And fso.FileExists(pipelineScript) Then
  sh.CurrentDirectory = repoRoot
  cmd = """" & hermesPy & """ -u """ & pipelineScript & """"
  rc = sh.Run(cmd, 0, True)
  WScript.Quit rc
End If

Set logFile = fso.OpenTextFile(repoRoot & "\.nur\quotes-pipeline.log", 8, True)
logFile.WriteLine "[" & Now & "] pipeline Python missing (run scripts/install-quotes-venv.ps1); fallback sync has NO Raindrop ingest"
logFile.Close

If Not fso.FileExists(ps1) Then
  WScript.Quit 2
End If

sh.CurrentDirectory = repoRoot
cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & ps1 & """"
rc = sh.Run(cmd, 0, True)
WScript.Quit rc

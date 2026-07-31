' Utterly silent launcher for quotes/books poll-sync.
'
' Task Scheduler "Interactive" + powershell.exe still allocates a console and
' can steal focus during games/recordings even with -WindowStyle Hidden.
' wscript.exe is a GUI-subsystem host (no console). .Run(..., 0, True) starts
' the child with SW_HIDE = 0 so nothing appears on screen.
'
' Prefer Hermes Python poller (CREATE_NO_WINDOW on git/python children).
' Fall back to the repo PowerShell entrypoint only if that script is missing.

Option Explicit

Dim fso, sh, hermesPy, hermesScript, repoRoot, ps1, cmd, rc

Set fso = CreateObject("Scripting.FileSystemObject")
Set sh  = CreateObject("WScript.Shell")

repoRoot = "C:\Users\david\Laboratory\nuroctane.xyz"
hermesPy = "C:\Users\david\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe"
hermesScript = "C:\Users\david\AppData\Local\hermes\scripts\poll-sync.py"
ps1 = repoRoot & "\scripts\poll-sync.ps1"

If fso.FileExists(hermesPy) And fso.FileExists(hermesScript) Then
  sh.CurrentDirectory = "C:\Users\david\AppData\Local\hermes\scripts"
  cmd = """" & hermesPy & """ -u """ & hermesScript & """"
  rc = sh.Run(cmd, 0, True)
  WScript.Quit rc
End If

If Not fso.FileExists(ps1) Then
  WScript.Quit 2
End If

sh.CurrentDirectory = repoRoot
cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & ps1 & """"
rc = sh.Run(cmd, 0, True)
WScript.Quit rc

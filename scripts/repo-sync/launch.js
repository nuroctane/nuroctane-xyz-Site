// Runs sync.ps1 with no window at all.
//
// Task Scheduler starts this through wscript.exe, a GUI-subsystem host, so no
// console is ever created; Run(..., 0, true) starts PowerShell hidden (SW_HIDE)
// and waits, so the task's Last Run Result is sync.ps1's exit code. A task that
// runs powershell.exe directly flashes a console even with -WindowStyle Hidden.
// JScript rather than VBScript because Windows is phasing VBScript out; the
// task passes //E:JScript so a re-associated .js extension can't change that.

var shell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");
var here = fso.GetParentFolderName(WScript.ScriptFullName);
var powershell = shell.ExpandEnvironmentStrings("%SystemRoot%") +
  "\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
var command = '"' + powershell + '" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' +
  here + '\\sync.ps1"';

WScript.Quit(shell.Run(command, 0, true));

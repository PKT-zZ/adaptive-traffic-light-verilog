param([switch]$Wave, [string]$Python = 'python', [string]$GtkWave = 'gtkwave')
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectRoot
$toolBin='C:\msys64\ucrt64\bin'
if(Test-Path -LiteralPath $toolBin){$env:Path=$env:Path+';'+$toolBin}
if(-not(Get-Command $Python -ErrorAction SilentlyContinue)){throw 'Python 3 is required. Pass -Python with its executable path.'}
& $Python -B "$PSScriptRoot\run_tests.py"
if($LASTEXITCODE -ne 0){throw 'Test run failed. See the error above and the run logs.'}
if($Wave){
    $viewer=Get-Command $GtkWave -ErrorAction SilentlyContinue
    if(-not $viewer){throw 'GTKWave not found. Add it to PATH or pass -GtkWave with its executable path.'}
    Start-Process -FilePath $viewer.Source -ArgumentList 'build/demo.vcd','demo.gtkw'
}

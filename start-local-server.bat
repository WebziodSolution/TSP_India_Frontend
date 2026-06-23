@echo off
setlocal
set ERRORS=0

REM Exit if any command fails
call :run "npm run clean:local" || goto :error
call :run "npm run build:local" || goto :error
call :run "npx cap copy" || goto :error
call :run "npx cap sync" || goto :error

echo ✅ All steps completed successfully!
goto :end

:error
echo ❌ An error occurred. Exiting...
exit /b 1

:run
echo ----------------------
echo Running: %~1
echo ----------------------
cmd /c %~1
exit /b %ERRORLEVEL%

:end
exit /b 0

@echo off
setlocal
set ERRORS=0

REM Exit if any command fails
call :run "npm run clean:local" || goto :error
call :run "npm run build:prod" || goto :error
call :run "npx cap copy" || goto :error
call :run "npx cap sync" || goto :error

REM This is the corrected gradle command execution
pushd android
call :run "gradlew.bat clean assembleDebug" || (popd && goto :error)
popd

REM Check if APK was generated (changed to debug since that's what we're building)
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo ✅ APK has been successfully created at android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo ❌ Debug APK creation failed.
    set /a ERRORS+=1
    goto :error
)

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
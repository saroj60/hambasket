
# 1. Define Paths
$ADB = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$GRADLEW = ".\frontend\android\gradlew.bat"

# 2. Uninstall potential conflicting apps
Write-Host "--- Uninstalling Old Apps (Emulator) ---"
& $ADB -s emulator-5554 uninstall com.hamket.app
& $ADB -s emulator-5554 uninstall com.aonekirana.app

# 3. Clean Build
Write-Host "--- Cleaning Build ---"
Set-Location frontend\android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
.\gradlew.bat installDebug

# 5. Launch App
Write-Host "--- Launching App (Emulator) ---"
& $ADB -s emulator-5554 shell am start -n com.aonekirana.app/com.aonekirana.app.MainActivity

Write-Host "--- DONE ---"

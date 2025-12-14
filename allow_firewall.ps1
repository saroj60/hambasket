$ports = @(5000, 5173)

Write-Host "Configuring Firewall for Quick Commerce App..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $ruleName = "Allow_HB_Port_$port"
    
    # Check if rule exists
    $existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Host "✅ Rule for port $port already exists." -ForegroundColor Green
    } else {
        try {
            New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow | Out-Null
            Write-Host "✅ Created inbound rule for port $port." -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to create rule for $port. Run as Administrator!" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "Firewall configuration complete!" -ForegroundColor Cyan
Write-Host "You should now be able to access the app from your phone at:"
Write-Host "http://192.168.254.40:5173" -ForegroundColor Yellow

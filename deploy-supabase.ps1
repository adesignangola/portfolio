$ErrorActionPreference = "Stop"

$PROJECT_REF = "xahrwrfttaazplqarcha"
$ACCESS_TOKEN = "sbp_5ba1cf8860d5b948e130c102caaac5a33071d63d"
$DATABASE_PASSWORD = "k73.gW+Yqv9jD7W"

Write-Host "=== Supabase SQL Deploy ===" -ForegroundColor Cyan
Write-Host "Project: $PROJECT_REF" -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $ACCESS_TOKEN"
    "Content-Type" = "application/json"
}

$sqlContent = Get-Content -Path "supabase-schema.sql" -Raw

$body = @{
    query = $sqlContent
    params = @()
} | ConvertTo-Json -Depth 10

Write-Host "Executing SQL..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "SUCCESS: SQL executed!" -ForegroundColor Green
    if ($response) {
        Write-Host "Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying alternative method..." -ForegroundColor Yellow

    $pgConnBody = @{
        password = $DATABASE_PASSWORD
    } | ConvertTo-Json

    $pgResponse = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/database/connection" -Method POST -Headers $headers -Body $pgConnBody -ContentType "application/json"

    if ($pgResponse.uri) {
        Write-Host "PostgreSQL URI obtained: $($pgResponse.uri.Substring(0, 50))..." -ForegroundColor Green
        Write-Host ""
        Write-Host "=== EXECUÇÃO MANUAL SQL REQUERIDA ===" -ForegroundColor Red
        Write-Host "Execute este SQL no Editor SQL do Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Vá para: https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "2. Selecione projeto: portfolio ($PROJECT_REF)" -ForegroundColor White
        Write-Host "3. Vá para SQL Editor" -ForegroundColor White
        Write-Host "4. Copie conteúdo de supabase-schema.sql" -ForegroundColor White
        Write-Host "5. Execute" -ForegroundColor White
    }
}
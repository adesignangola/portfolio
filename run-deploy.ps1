$headers = @{
    "Authorization" = "Bearer sbp_63337fef46b325081c5c45179480b557d89f0475"
    "Content-Type" = "application/json"
    "apikey" = "sbp_63337fef46b325081c5c45179480b557d89f0475"
}

$sql = Get-Content "supabase-schema.sql" -Raw

$body = @{
    query = $sql
} | ConvertTo-Json -Depth 10

Write-Host "Implantando SQL no Supabase..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/xahrwrfttaazplqarcha/database/query" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "SUCESSO! Tabelas criadas!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
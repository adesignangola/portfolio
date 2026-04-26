#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════════════════
# NOX — Until Zero Errors (UzE)
# Script de verificação contínua que só PARA quando não houver erros
# ═══════════════════════════════════════════════════════════════════════════════

param(
    [int]$MaxAttempts = 10,
    [int]$DelayMs = 1000
)

$ErrorActionPreference = "Stop"
$start = Get-Date

function TEST-TYPESCRIPT {
    $output = npm run lint 2>&1
    if ($output -match "error TS") {
        Write-Host "[TS] ❌ Erros encontrados" -ForegroundColor Red
        $output | Select-String "error TS" | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        return $false
    }
    Write-Host "[TS] ✅ TypeScript OK" -ForegroundColor Green
    return $true
}

function TEST-BUILD {
    $output = npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[BUILD] ❌ Falhou" -ForegroundColor Red
        return $false
    }
    Write-Host "[BUILD] ✅ Build OK" -ForegroundColor Green
    return $true
}

function TEST-DIST {
    if (-not (Test-Path "dist/index.html")) {
        Write-Host "[DIST] ❌ Pasta dist não existe" -ForegroundColor Red
        return $false
    }
    Write-Host "[DIST] ✅ Dist OK" -ForegroundColor Green
    return $true
}

function RUN-AUDIT {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  NOX — UZE Audit attempt $Attempt/$MaxAttempts" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    $ts = TEST-TYPESCRIPT
    $build = TEST-BUILD
    $dist = TEST-DIST
    
    $allPassed = $ts -and $build -and $dist
    
    return $allPassed
}

# ═══════════════════════════════════════════════════════════════════════════════════════
# MAIN LOOP — só para quando não houver erros
# ═══════════════════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  NOX — UNTIL ZERO ERRORS (UzE)" -ForegroundColor Cyan
Write-Host "  Script de verificação contínua" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$Attempt = 1

while ($Attempt -le $MaxAttempts) {
    $passed = RUN-AUDIT
    
    if ($passed) {
        Write-Host ""
        Write-Host "═════════════════════════���═════════════════════════" -ForegroundColor Green
        Write-Host "  ✅ ZERO ERROS — PRONTO PARA PRODUÇÃO" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tentativas: $Attempt" -ForegroundColor Gray
        Write-Host "Tempo: $(((Get-Date) - $start).TotalSeconds)s" -ForegroundColor Gray
        Write-Host ""
        exit 0
    }
    
    Write-Host "[WAIT] A tunggu... ${DelayMs}ms" -ForegroundColor Yellow
    Start-Sleep -Milliseconds $DelayMs
    $Attempt++
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  ❌ MAX ATTEMPTS EXCEDIDOS" -ForegroundColor Red
Write-Host "  ($MaxAttempts tentativas)" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""

exit 1
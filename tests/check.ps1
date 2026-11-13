# Shared test helper. Load it with:  . .\tests\check.ps1
$global:passCount = 0
$global:failCount = 0

function Check {
  param($Name, $Expected, $Method, $Path, $Body, $Token)
  $params = @{ Method = $Method; Uri = "http://localhost:5000$Path"; ContentType = 'application/json'; UseBasicParsing = $true }
  if ($Token) { $params.Headers = @{ Authorization = "Bearer $Token" } }
  if ($Body)  { $params.Body = $Body | ConvertTo-Json }
  $status = 0; $msg = ''; $global:last = $null
  try {
    $r = Invoke-WebRequest @params
    $status = [int]$r.StatusCode
    $global:last = $r.Content | ConvertFrom-Json
  } catch {
    if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode; $msg = $_.ErrorDetails.Message }
    else { $msg = 'Cannot reach server - is the backend running?' }
  }
  if ($status -eq $Expected) {
    $global:passCount++
    Write-Host "PASS  $Name ($status)" -ForegroundColor Green
  } else {
    $global:failCount++
    Write-Host "FAIL  $Name (expected $Expected, got $status) $msg" -ForegroundColor Red
  }
}

function Show-Summary {
  $color = if ($global:failCount -eq 0) { 'Green' } else { 'Red' }
  Write-Host "`nRESULT: $global:passCount passed, $global:failCount failed" -ForegroundColor $color
}
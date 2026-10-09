$chapters = @();
Get-ChildItem ".\historia\*.md" | Sort-Object Name | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8;
    $lines = $content -split "`n";
    $titulo = ($lines | Where-Object { $_ -match '^titulo:' } | Select-Object -First 1) -replace 'titulo:\s*"?([^"]*)"?','$1';
    $acto = ($lines | Where-Object { $_ -match '^acto:' } | Select-Object -First 1) -replace 'acto:\s*"?([^"]*)"?','$1';
    $segmento = ($lines | Where-Object { $_ -match '^segmento:' } | Select-Object -First 1) -replace 'segmento:\s*"?([^"]*)"?','$1';
    $periodo = ($lines | Where-Object { $_ -match '^periodobiblico:' } | Select-Object -First 1) -replace 'periodobiblico:\s*"?([^"]*)"?','$1';
    
    $chapters += [PSCustomObject]@{
        id = $_.Name.Replace('.md', '');
        acto = $acto.Trim();
        segmento = $segmento.Trim();
        titulo = $titulo.Trim();
        periodo = $periodo.Trim();
        content = [string]$content
    }
};
$json = $chapters | ConvertTo-Json -Depth 5
$path1 = Join-Path (Get-Location) "data.json"
[System.IO.File]::WriteAllText($path1, $json, [System.Text.Encoding]::UTF8)
if (Test-Path ".\web_app") {
    $path2 = Join-Path (Get-Location) "web_app\data.json"
    [System.IO.File]::WriteAllText($path2, $json, [System.Text.Encoding]::UTF8)
}
Write-Host "¡data.json actualizado con exito! Refresca tu navegador para ver los cambios." -ForegroundColor Green
Start-Sleep -Seconds 3

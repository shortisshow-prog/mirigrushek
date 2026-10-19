# Раскладывает фото по папкам по номерам кадров (например DSC_9265.JPG -> папка "ЛАД 14.10").
# Файлы КОПИРУЮТСЯ, оригиналы остаются на месте.

$sources = @(
    "C:\Users\Admin04\Desktop\фотографии",
    "C:\Users\Admin04\Desktop\102NIKON"
)
$target = "C:\Users\Admin04\Desktop\Отобранные фото"

# Группы и номера кадров (из записки). Правьте при необходимости.
$groups = [ordered]@{
    "ВЭД"        = @(9475)
    "ЛАД 14.10"  = @(9265, 9354, 9370, 9378, 9409, 9439, 9496, 9504)
    "Никита"     = @(1189, 1192, 1210, 1217, 1243, 1267, 1273, 1278, 1293, 1296, 1301, 1307, 1325)
}

$found = @{}
foreach ($g in $groups.Keys) {
    $dir = Join-Path $target $g
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    foreach ($src in $sources) {
        if (-not (Test-Path $src)) { Write-Warning "Нет папки: $src"; continue }
        Get-ChildItem -Path $src -File -Recurse | ForEach-Object {
            foreach ($n in $groups[$g]) {
                # номер стоит отдельно: DSC_9265.JPG, IMG9265.NEF, но не 19265
                if ($_.BaseName -match "(^|\D)0*$n(\D|$)") {
                    Copy-Item $_.FullName -Destination $dir -Force
                    Write-Host "$g  <-  $($_.FullName)"
                    $found["$g|$n"] = $true
                }
            }
        }
    }
}

Write-Host "`n=== Не найдены ==="
foreach ($g in $groups.Keys) {
    foreach ($n in $groups[$g]) { if (-not $found["$g|$n"]) { Write-Host "$g : $n" } }
}
Write-Host "`nГотово. Результат: $target"
Read-Host "Нажмите Enter для выхода"

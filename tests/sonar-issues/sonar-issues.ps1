[CmdletBinding()]
param (
    [switch]$NewCode,
    [string]$Out = "sonar-issues.json"
)

$ErrorActionPreference = "Stop"

$SONAR_URL = "https://sonar.wk-archi-o24a-4-5-g1.fr"
$PROJECT_KEY = "thetiptop"

if (-not $env:SONAR_TOKEN) {
    [Console]::Error.WriteLine("Erreur: variable d'environnement SONAR_TOKEN absente.")
    exit 1
}

$query = "componentKeys=${PROJECT_KEY}&issueStatuses=OPEN,CONFIRMED&ps=500"
if ($NewCode) {
    $query += "&inNewCodePeriod=true"
    [Console]::Error.WriteLine("Recuperation des issues (new code uniquement)...")
}
else {
    [Console]::Error.WriteLine("Recuperation des issues (tout le projet)...")
}

# curl.exe natif Windows avec option -k (ignore SSL)
$issuesJson = & curl.exe -k -sS -u "${env:SONAR_TOKEN}:" "${SONAR_URL}/api/issues/search?${query}"
$rawIssues = $issuesJson | ConvertFrom-Json
$rawIssues | ConvertTo-Json -Depth 10 | Set-Content -Path $Out -Encoding utf8

$total = $rawIssues.total
[Console]::Error.WriteLine("Total: $total issue(s)`n")

if ($rawIssues.issues.Count -gt 0) {
    $formattedIssues = foreach ($issue in $rawIssues.issues) {
        [PSCustomObject]@{
            Severity  = $issue.severity
            Component = ($issue.component -replace "^${PROJECT_KEY}:", "")
            Line      = if ($issue.line) { "L$($issue.line)" } else { "L?" }
            Rule      = $issue.rule
            Message   = $issue.message
        }
    }
    $formattedIssues | Sort-Object Severity | Format-Table -AutoSize
}

[Console]::Error.WriteLine("`nJSON complet: $Out`n")

# ── Quality gate ────────────────────────────────────────────────────────────
[Console]::Error.WriteLine("=== Quality gate ===")

$gateJson = & curl.exe -k -sS -u "${env:SONAR_TOKEN}:" "${SONAR_URL}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}"
$gate = $gateJson | ConvertFrom-Json

Write-Output "Statut global: $($gate.projectStatus.status)`n"

if ($gate.projectStatus.conditions) {
    $conditions = foreach ($c in $gate.projectStatus.conditions) {
        $statusDisplay = if ($c.status -eq "ERROR") { "ECHEC" } else { "  ok " }
        $actual = if ($null -ne $c.actualValue) { $c.actualValue } else { "-" }
        $threshold = if ($null -ne $c.errorThreshold) { "$($c.comparator) $($c.errorThreshold)" } else { "-" }

        [PSCustomObject]@{
            Statut   = $statusDisplay
            Metrique = $c.metricKey
            Actuel   = $actual
            Seuil    = $threshold
        }
    }
    $conditions | Format-Table -AutoSize
}
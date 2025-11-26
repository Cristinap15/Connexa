<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db_bootstrap_mysqli.php';

$sql = "
  SELECT
    c.id,
    c.name,
    c.company,
    c.email,
    c.phone,
    c.status,
    c.created_at,
    COUNT(p.id) AS projects_count,
    COALESCE(SUM(p.budget), 0) AS total_value
  FROM clients c
  LEFT JOIN projects p ON p.client_id = c.id
  GROUP BY
    c.id,
    c.name,
    c.company,
    c.email,
    c.phone,
    c.status,
    c.created_at
  ORDER BY c.created_at DESC, c.id DESC
";

$stmt = $mysqli->query($sql);
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to load clients', 'details' => $mysqli->error]);
  exit;
}

$rows = $stmt->fetch_all(MYSQLI_ASSOC);
echo json_encode(['clients' => $rows]);

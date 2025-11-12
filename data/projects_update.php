<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db_bootstrap_mysqli.php';

// Accept JSON body
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true) ?? [];

function respond($code, $data) { http_response_code($code); echo json_encode($data); exit; }

$id = isset($payload['id']) ? (int)$payload['id'] : 0;
if ($id <= 0) respond(422, ['error' => 'Missing id']);

// For now we only support status updates (used by the UI)
if (!isset($payload['status'])) respond(400, ['error' => 'No updatable fields provided']);
$st = $payload['status'];
$allowed = ['Not Started','In Progress','Done'];
if (!in_array($st, $allowed, true)) respond(422, ['error' => 'Invalid status']);

try {
    $stmt = $mysqli->prepare('UPDATE projects SET status = ? WHERE id = ?');
    $stmt->bind_param('si', $st, $id);
    $stmt->execute();
    $stmt->close();
    $project = loadProject($mysqli, $id);
    respond(200, ['project' => $project]);
} catch (Throwable $e) {
    respond(500, ['error' => 'Failed to update project', 'details' => $e->getMessage()]);
}

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

try {
    $stmt = $mysqli->prepare('DELETE FROM projects WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    respond(200, ['ok' => true]);
} catch (Throwable $e) {
    respond(500, ['error' => 'Failed to delete project', 'details' => $e->getMessage()]);
}

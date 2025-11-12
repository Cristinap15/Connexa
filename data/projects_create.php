<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db_bootstrap_mysqli.php';

// Accept JSON or form-encoded
$payload = [];
if (($_SERVER['CONTENT_TYPE'] ?? '') && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true) ?? [];
} else {
    $payload = $_POST;
}

function respond($code, $data) { http_response_code($code); echo json_encode($data); exit; }

$name       = trim($payload['project_name'] ?? '');
$clientName = trim($payload['client_name'] ?? '');
$description= trim($payload['description'] ?? '');
$budget     = $payload['budget'] ?? null;
$dueDate    = $payload['due_date'] ?? null;
$status     = $payload['status'] ?? 'Not Started';

if ($name === '' || $clientName === '' || $budget === null || $dueDate === null) {
    respond(422, ['error' => 'Missing required fields']);
}

$allowed = ['Not Started','In Progress','Done'];
if (!in_array($status, $allowed, true)) { $status = 'Not Started'; }

try {
    $mysqli->begin_transaction();
    $clientId = getOrCreateClientId($mysqli, $clientName);
    $stmt = $mysqli->prepare('INSERT INTO projects(client_id, name, description, budget, due_date, status) VALUES(?,?,?,?,?,?)');
    $desc = $description !== '' ? $description : null;
    $stmt->bind_param('issdss', $clientId, $name, $desc, $budget, $dueDate, $status);
    $stmt->execute();
    $id = (int)$mysqli->insert_id;
    $stmt->close();
    $mysqli->commit();

    $project = loadProject($mysqli, $id);
    respond(201, ['project' => $project]);
} catch (Throwable $e) {
    if ($mysqli->errno) { $mysqli->rollback(); }
    respond(500, ['error' => 'Failed to create project', 'details' => $e->getMessage()]);
}

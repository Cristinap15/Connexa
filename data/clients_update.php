<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db_bootstrap_mysqli.php';

// Accept JSON or form-encoded payloads
$payload = [];
if (($_SERVER['CONTENT_TYPE'] ?? '') && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];
} else {
    $payload = $_POST;
}

function respond($code, $data) { http_response_code($code); echo json_encode($data); exit; }

$id      = isset($payload['id']) ? (int)$payload['id'] : 0;
$name    = trim($payload['client_name'] ?? '');
$company = trim($payload['company'] ?? '');
$email   = trim($payload['email'] ?? '');
$phone   = trim($payload['phone'] ?? '');
$status  = trim($payload['status'] ?? 'Active');

// Prepare nullable values for bind_param (must be variables, not expressions)
$companyVal = ($company !== '') ? $company : null;
$emailVal   = ($email !== '') ? $email : null;
$phoneVal   = ($phone !== '') ? $phone : null;

if ($id <= 0) {
    respond(400, ['error' => 'Client id is required']);
}
if ($name === '') {
    respond(422, ['error' => 'Client name is required']);
}

$allowedStatus = ['Active', 'Inactive'];
if (!in_array($status, $allowedStatus, true)) {
    $status = 'Active';
}

try {
    $stmt = $mysqli->prepare('UPDATE clients SET name = ?, company = ?, email = ?, phone = ?, status = ? WHERE id = ?');
    if (!$stmt) {
        respond(500, ['error' => 'Failed to update client', 'details' => $mysqli->error, 'errno' => $mysqli->errno]);
    }
    $stmt->bind_param('sssssi', $name, $companyVal, $emailVal, $phoneVal, $status, $id);
    $stmt->execute();
    if ($stmt->errno) {
        // Duplicate name
        if ($stmt->errno === 1062) {
            respond(409, ['error' => 'A client with that name already exists']);
        }
        respond(500, ['error' => 'Failed to update client', 'details' => $stmt->error, 'errno' => $stmt->errno]);
    }
    $affected = $stmt->affected_rows;
    $stmt->close();

    respond(200, [
        'client' => [
            'id' => $id,
            'name' => $name,
            'company' => $company,
            'email' => $email,
            'phone' => $phone,
            'status' => $status,
        ],
        'updated' => $affected,
    ]);
} catch (Throwable $e) {
    // If mysqli error code is set, surface it
    if (method_exists($mysqli, 'errno') && $mysqli->errno === 1062) {
        respond(409, ['error' => 'A client with that name already exists']);
    }
    respond(500, ['error' => 'Failed to update client', 'details' => $e->getMessage()]);
}

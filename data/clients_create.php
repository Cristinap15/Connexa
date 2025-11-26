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

$name    = trim($payload['client_name'] ?? '');
$company = trim($payload['company'] ?? '');
$email   = trim($payload['email'] ?? '');
$phone   = trim($payload['phone'] ?? '');
$status  = trim($payload['status'] ?? 'Active');

// Prepare nullable values for bind_param (must be variables, not expressions)
$companyVal = ($company !== '') ? $company : null;
$emailVal   = ($email !== '') ? $email : null;
$phoneVal   = ($phone !== '') ? $phone : null;

if ($name === '') {
    respond(422, ['error' => 'Client name is required']);
}

$allowedStatus = ['Active', 'Inactive'];
if (!in_array($status, $allowedStatus, true)) {
    $status = 'Active';
}

try {
    $stmt = $mysqli->prepare('INSERT INTO clients(name, company, email, phone, status) VALUES(?,?,?,?,?)');
    if (!$stmt) {
        respond(500, ['error' => 'Failed to create client', 'details' => $mysqli->error, 'errno' => $mysqli->errno]);
    }
    $stmt->bind_param('sssss', $name, $companyVal, $emailVal, $phoneVal, $status);
    $stmt->execute();
    $id = (int)$mysqli->insert_id;
    $stmt->close();

    respond(201, [
        'client' => [
            'id' => $id,
            'name' => $name,
            'company' => $company,
            'email' => $email,
            'phone' => $phone,
            'status' => $status,
            'projects_count' => 0,
            'total_value' => 0,
        ]
    ]);
} catch (Throwable $e) {
    if ($mysqli->errno === 1062) { // duplicate
        respond(409, ['error' => 'A client with that name already exists']);
    }
    respond(500, ['error' => 'Failed to create client', 'details' => $e->getMessage()]);
}

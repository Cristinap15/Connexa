<?php
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db_bootstrap_mysqli.php';

$payload = [];
if (($_SERVER['CONTENT_TYPE'] ?? '') && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];
} else {
    $payload = $_POST;
}

function respond($code, $data) { http_response_code($code); echo json_encode($data); exit; }

$name = trim($payload['fullname'] ?? '');
$email = trim($payload['email'] ?? '');
$password = $payload['password'] ?? '';
$role = 'user';

if ($name === '' || $email === '' || $password === '') {
    respond(422, ['error' => 'All fields are required']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['error' => 'Invalid email']);
}
if (strlen($password) < 8) {
    respond(422, ['error' => 'Password must be at least 8 characters']);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $mysqli->prepare('INSERT INTO users(name, email, password_hash, role) VALUES(?,?,?,?)');
    if (!$stmt) {
        respond(500, ['error' => 'Failed to create user', 'details' => $mysqli->error]);
    }
    $stmt->bind_param('ssss', $name, $email, $hash, $role);
    $stmt->execute();
    if ($stmt->errno === 1062) {
        respond(409, ['error' => 'Email already registered']);
    }
    $userId = (int)$mysqli->insert_id;
    $stmt->close();

    $_SESSION['user_id'] = $userId;
    respond(201, ['user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => $role]]);
} catch (Throwable $e) {
    respond(500, ['error' => 'Failed to create user', 'details' => $e->getMessage()]);
}

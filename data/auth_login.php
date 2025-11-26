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

$email = trim($payload['email'] ?? '');
$password = $payload['password'] ?? '';

if ($email === '' || $password === '') {
    respond(422, ['error' => 'Email and password are required']);
}

$stmt = $mysqli->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
if (!$stmt) {
    respond(500, ['error' => 'Failed to login', 'details' => $mysqli->error]);
}
$stmt->bind_param('s', $email);
$stmt->execute();
$res = $stmt->get_result();
$user = $res ? $res->fetch_assoc() : null;
$stmt->close();

if (!$user || !password_verify($password, $user['password_hash'])) {
    respond(401, ['error' => 'Invalid email or password']);
}

$_SESSION['user_id'] = (int)$user['id'];
respond(200, [
    'user' => [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ]
]);

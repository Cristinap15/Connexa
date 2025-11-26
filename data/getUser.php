<?php
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db_bootstrap_mysqli.php';

// Default placeholder if no session user
$fallback = [
    'name' => 'Guest User',
    'email' => 'guest@connexa.local',
    'avatar' => './images/user-avatar.png'
];

if (!isset($_SESSION['user_id'])) {
    echo json_encode($fallback);
    exit;
}

$id = (int)$_SESSION['user_id'];
$stmt = $mysqli->prepare('SELECT name, email, avatar FROM users WHERE id = ? LIMIT 1');
if (!$stmt) {
    echo json_encode($fallback);
    exit;
}
$stmt->bind_param('i', $id);
$stmt->execute();
$res = $stmt->get_result();
$user = $res ? $res->fetch_assoc() : null;
$stmt->close();

if ($user) {
    // Keep the default avatar when none is stored and mark as placeholder to style a violet circle
    if (empty($user['avatar'])) {
        $user['avatar'] = $fallback['avatar'];
        $user['avatar_placeholder'] = true;
    }
    echo json_encode($user);
    exit;
}

echo json_encode($fallback);

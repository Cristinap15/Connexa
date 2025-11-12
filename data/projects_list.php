<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/db_bootstrap_mysqli.php';

$q = trim($_GET['q'] ?? '');

if ($q === '') {
    $sql = 'SELECT p.*, c.name AS client_name FROM projects p JOIN clients c ON p.client_id = c.id ORDER BY p.created_at DESC, p.id DESC';
    $res = $mysqli->query($sql);
    $rows = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
    echo json_encode(['projects' => $rows]);
    exit;
}

$like = '%' . $q . '%';
$stmt = $mysqli->prepare('SELECT p.*, c.name AS client_name FROM projects p JOIN clients c ON p.client_id = c.id WHERE p.name LIKE ? OR c.name LIKE ? OR p.description LIKE ? ORDER BY p.created_at DESC, p.id DESC');
$stmt->bind_param('sss', $like, $like, $like);
$stmt->execute();
$res = $stmt->get_result();
$rows = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
$stmt->close();
echo json_encode(['projects' => $rows]);

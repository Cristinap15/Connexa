<?php
$host = 'localhost';
$db   = 'connexa_bd';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Establish mysqli connection
$mysqli = @new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'DB connection failed', 'details' => $mysqli->connect_error]);
    exit;
}
$mysqli->set_charset($charset);
?>


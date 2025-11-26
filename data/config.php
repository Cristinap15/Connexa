<?php
$host = 'localhost';
$db   = 'connexa_bd';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Establish mysqli connection; if DB is missing, create it then reconnect.
$mysqli = @new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno === 1049) { // Unknown database
    $tmp = @new mysqli($host, $user, $pass);
    if ($tmp && !$tmp->connect_errno) {
        $tmp->query("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $tmp->close();
        $mysqli = @new mysqli($host, $user, $pass, $db);
    }
}
if ($mysqli->connect_errno) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'DB connection failed', 'details' => $mysqli->connect_error]);
    exit;
}
$mysqli->set_charset($charset);
?>


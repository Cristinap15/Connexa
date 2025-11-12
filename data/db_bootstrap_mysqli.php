<?php
// MySQLi bootstrap used by API endpoints.
// - Creates a $mysqli connection
// - Ensures required tables exist
// - Exposes helpers: getOrCreateClientId(), loadProject()

header('Content-Type: application/json');

// Load DB credentials. config.php also tries to create a PDO connection,
// which might throw if DB isn't ready. Catch and continue; we only need
// $host, $db, $user, $pass for MySQLi here.
try {
    require_once __DIR__ . '/config.php'; // defines $host, $db, $user, $pass
} catch (Throwable $e) {
    // Proceed if credentials are defined; otherwise surface a clear error.
    if (!isset($host, $db, $user, $pass)) {
        http_response_code(500);
        echo json_encode([
            'error' => 'DB credentials not configured',
            'details' => $e->getMessage(),
        ]);
        exit;
    }
}

// Establish MySQLi connection using the same credentials as PDO config
// Ensure mysqli does not throw fatal exceptions so we can return JSON
if (function_exists('mysqli_report')) { mysqli_report(MYSQLI_REPORT_OFF); }
$mysqli = @new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode([
        'error' => 'DB connection failed',
        'details' => $mysqli->connect_error,
    ]);
    exit;
}
$mysqli->set_charset('utf8mb4');

// Ensure schema exists (idempotent)
$mysqli->query("CREATE TABLE IF NOT EXISTS clients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$mysqli->query("CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status ENUM('Not Started','In Progress','Done') NOT NULL DEFAULT 'Not Started',
  hours_spent INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_client FOREIGN KEY (client_id)
    REFERENCES clients(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Helper: fetch or create a client by name
function getOrCreateClientId(mysqli $mysqli, string $clientName): int {
    $stmt = $mysqli->prepare('SELECT id FROM clients WHERE name = ?');
    $stmt->bind_param('s', $clientName);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmt->close();
    if ($row) return (int)$row['id'];

    $ins = $mysqli->prepare('INSERT INTO clients(name) VALUES (?)');
    $ins->bind_param('s', $clientName);
    $ins->execute();
    $id = (int)$mysqli->insert_id;
    $ins->close();
    return $id;
}

// Helper: load a project (with client_name) by id
function loadProject(mysqli $mysqli, int $id): array {
    $stmt = $mysqli->prepare('SELECT p.*, c.name AS client_name FROM projects p JOIN clients c ON p.client_id = c.id WHERE p.id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res ? $res->fetch_assoc() : [];
    $stmt->close();
    return $row ?: [];
}

?>

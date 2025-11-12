<?php
// Ensures required tables exist. Include this at the top of API endpoints.
require_once __DIR__ . '/config.php';

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS clients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
SQL);

$pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS projects (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
SQL);

// Helper: fetch or create a client by name
function getOrCreateClientId(PDO $pdo, string $clientName): int {
    $sel = $pdo->prepare('SELECT id FROM clients WHERE name = ?');
    $sel->execute([$clientName]);
    $row = $sel->fetch();
    if ($row) return (int)$row['id'];
    $ins = $pdo->prepare('INSERT INTO clients(name) VALUES (?)');
    $ins->execute([$clientName]);
    return (int)$pdo->lastInsertId();
}

// Helper: hydrate project with client_name
function loadProject(PDO $pdo, int $id): array {
    $stmt = $pdo->prepare('SELECT p.*, c.name AS client_name FROM projects p JOIN clients c ON p.client_id = c.id WHERE p.id = ?');
    $stmt->execute([$id]);
    return (array)$stmt->fetch();
}


<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

require_once "../../config/db.php";

$search = $_GET['search'] ?? '';
$type = $_GET['type'] ?? 'all';
$limit = (int)($_GET['limit'] ?? 20);
$page = (int)($_GET['page'] ?? 1);
$offset = ($page - 1) * $limit;

// Base query
$sql = "SELECT id, name, email, user_type, is_banned, created_at FROM users WHERE user_type != 'admin'";
$params = [];

if ($search) {
    $sql .= " AND (name LIKE ? OR email LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if ($type !== 'all') {
    $sql .= " AND user_type = ?";
    $params[] = $type;
}

// Count total (same conditions)
$countSql = "SELECT COUNT(*) FROM users WHERE user_type != 'admin'";
$countParams = [];
if ($search) {
    $countSql .= " AND (name LIKE ? OR email LIKE ?)";
    $countParams[] = "%$search%";
    $countParams[] = "%$search%";
}
if ($type !== 'all') {
    $countSql .= " AND user_type = ?";
    $countParams[] = $type;
}

$countStmt = $pdo->prepare($countSql);
$countStmt->execute($countParams);
$total = $countStmt->fetchColumn();

// Add ORDER BY and LIMIT (no placeholders for LIMIT/OFFSET to avoid syntax error)
$sql .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$users = $stmt->fetchAll();

echo json_encode([
    "success" => true,
    "data" => $users,
    "total" => (int)$total,
    "page" => $page,
    "total_pages" => ceil($total / $limit)
]);
?>
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
$limit = (int)($_GET['limit'] ?? 20);
$page = (int)($_GET['page'] ?? 1);
$offset = ($page - 1) * $limit;

$sql = "SELECT d.*, u.name as owner_name FROM dormitories d JOIN users u ON d.owner_id = u.id WHERE d.is_verified = 1";
$params = [];

if ($search) {
    $sql .= " AND (d.name LIKE ? OR d.location LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$countSql = str_replace("SELECT d.*, u.name as owner_name", "SELECT COUNT(*)", $sql);
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$total = $countStmt->fetchColumn();

$sql .= " ORDER BY d.verified_at DESC LIMIT $limit OFFSET $offset";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$dorms = $stmt->fetchAll();

echo json_encode([
    "success" => true,
    "data" => $dorms,
    "total" => (int)$total,
    "page" => $page,
    "total_pages" => ceil($total / $limit)
]);
?>
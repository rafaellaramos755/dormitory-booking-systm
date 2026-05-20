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

$status = $_GET['status'] ?? 'pending';
$search = $_GET['search'] ?? '';
$limit = (int)($_GET['limit'] ?? 15);
$page = (int)($_GET['page'] ?? 1);
$offset = ($page - 1) * $limit;

// ✅ FIXED SQL with proper JOIN
$sql = "SELECT a.*, u.name as owner_name, u.email as owner_email 
        FROM dorm_applications a 
        JOIN users u ON a.owner_id = u.id 
        WHERE a.status = ?";
$params = [$status];

if (!empty($search)) {
    $sql .= " AND (a.name LIKE ? OR u.name LIKE ? OR u.email LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

// Count total
$countSql = str_replace("SELECT a.*, u.name as owner_name, u.email as owner_email", "SELECT COUNT(*)", $sql);
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$total = $countStmt->fetchColumn();

// ✅ FIXED: Directly embed limit and offset (NO placeholders for LIMIT/OFFSET)
$sql .= " ORDER BY a.created_at DESC LIMIT $limit OFFSET $offset";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "data" => $applications,
    "total" => (int)$total,
    "page" => $page,
    "total_pages" => ceil($total / $limit)
]);
?>
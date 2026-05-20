<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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

// Get reports with reporter and reported user details
$sql = "SELECT r.*, 
        rep.name as reporter_name, rep.email as reporter_email,
        usr.name as reported_name, usr.email as reported_email,
        d.name as dorm_name
        FROM reports r
        LEFT JOIN users rep ON r.reporter_id = rep.id
        LEFT JOIN users usr ON r.reported_user_id = usr.id
        LEFT JOIN dormitories d ON r.reported_dorm_id = d.id
        WHERE r.status = :status";

$params = [':status' => $status];

if (!empty($search)) {
    $sql .= " AND (rep.name LIKE :search OR usr.name LIKE :search OR r.reason LIKE :search)";
    $params[':search'] = "%$search%";
}

// Count total
$countSql = str_replace("SELECT r.*, rep.name as reporter_name, rep.email as reporter_email, usr.name as reported_name, usr.email as reported_email, d.name as dorm_name", "SELECT COUNT(*)", $sql);
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$total = $countStmt->fetchColumn();

$sql .= " ORDER BY r.created_at DESC LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':status', $status);
if (!empty($search)) $stmt->bindValue(':search', "%$search%");
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "data" => $reports,
    "total" => (int)$total,
    "page" => $page,
    "total_pages" => ceil($total / $limit)
]);
?>
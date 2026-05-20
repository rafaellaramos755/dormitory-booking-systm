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

$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE user_type != 'admin'");
$total_users = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE user_type = 'owner'");
$total_owners = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) FROM dorm_applications WHERE status = 'pending'");
$pending_verifications = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) FROM dormitories WHERE status = 'active'");
$active_dorms = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) FROM dormitories WHERE status = 'inactive'");
$inactive_dorms = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) FROM reports WHERE status = 'pending'");
$pending_reports = $stmt->fetchColumn();

echo json_encode(["success" => true, "data" => [
    "total_users" => (int)$total_users,
    "total_owners" => (int)$total_owners,
    "pending_verifications" => (int)$pending_verifications,
    "active_dorms" => (int)$active_dorms,
    "inactive_dorms" => (int)$inactive_dorms,
    "pending_reports" => (int)$pending_reports
]]);
?>
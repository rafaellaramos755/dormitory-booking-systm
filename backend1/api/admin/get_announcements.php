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

$stmt = $pdo->query("SELECT a.*, u.name as admin_name FROM announcements a JOIN users u ON a.admin_id = u.id ORDER BY a.created_at DESC");
$announcements = $stmt->fetchAll();

echo json_encode(["success" => true, "data" => $announcements]);
?>
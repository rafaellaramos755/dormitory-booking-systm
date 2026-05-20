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

require_once "../../config/db.php";
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

$stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT " . $limit);
$stmt->execute([$_SESSION['user_id']]);
$notifications = $stmt->fetchAll();

$unreadStmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
$unreadStmt->execute([$_SESSION['user_id']]);
$unread = $unreadStmt->fetchColumn();

echo json_encode([
    "success" => true,
    "data" => $notifications,
    "unread_count" => (int)$unread
]);
?>
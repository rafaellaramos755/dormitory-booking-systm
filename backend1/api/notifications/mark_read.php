<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['notification_id'])) {
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
    $result = $stmt->execute([$data['notification_id'], $_SESSION['user_id']]);
    echo json_encode(["success" => $result]);
} elseif (isset($data['mark_all']) && $data['mark_all'] === true) {
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
    $result = $stmt->execute([$_SESSION['user_id']]);
    echo json_encode(["success" => $result]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
}
?>
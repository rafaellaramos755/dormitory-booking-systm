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

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$dorm_id = $data['dormitory_id'] ?? null;
$status = $data['status'] ?? 'inactive';

if (!$dorm_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

$stmt = $pdo->prepare("UPDATE dormitories SET status = ? WHERE id = ?");
$result = $stmt->execute([$status, $dorm_id]);

echo json_encode(["success" => $result, "message" => $result ? "Dormitory status updated" : "Update failed"]);
?>
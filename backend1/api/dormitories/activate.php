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
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$dormitory_id = $data['dormitory_id'] ?? null;

if (!$dormitory_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

// Verify ownership
$check = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
$check->execute([$dormitory_id, $_SESSION['user_id']]);
if (!$check->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
    exit();
}

$stmt = $pdo->prepare("UPDATE dormitories SET status = 'active' WHERE id = ?");
$result = $stmt->execute([$dormitory_id]);

if ($result) {
    echo json_encode(["success" => true, "message" => "Dormitory activated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to activate"]);
}
?>
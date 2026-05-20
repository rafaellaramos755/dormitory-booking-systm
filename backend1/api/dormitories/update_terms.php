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
$terms_text = $data['terms_text'] ?? null;

if (!$dormitory_id || !$terms_text) {
    echo json_encode(["success" => false, "message" => "Dormitory ID and terms text required"]);
    exit();
}

// Verify ownership
$check = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
$check->execute([$dormitory_id, $_SESSION['user_id']]);
if (!$check->fetch()) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

$stmt = $pdo->prepare("UPDATE dormitories SET terms_text = ? WHERE id = ?");
$result = $stmt->execute([$terms_text, $dormitory_id]);

echo json_encode(["success" => $result, "message" => $result ? "Terms updated" : "Update failed"]);
?>
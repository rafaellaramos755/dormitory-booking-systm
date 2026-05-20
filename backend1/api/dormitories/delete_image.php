<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
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
$image_id = $data['image_id'] ?? null;

if (!$image_id) {
    echo json_encode(["success" => false, "message" => "Image ID required"]);
    exit();
}

$checkStmt = $pdo->prepare("
    SELECT di.image_url 
    FROM dormitory_images di
    JOIN dormitories d ON di.dormitory_id = d.id
    WHERE di.id = ? AND d.owner_id = ?
");
$checkStmt->execute([$image_id, $_SESSION['user_id']]);
$image = $checkStmt->fetch();

if (!$image) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

$file_path = "../../" . $image['image_url'];
if (file_exists($file_path)) {
    unlink($file_path);
}

$stmt = $pdo->prepare("DELETE FROM dormitory_images WHERE id = ?");
$result = $stmt->execute([$image_id]);

echo json_encode(["success" => $result, "message" => $result ? "Image deleted" : "Delete failed"]);
?>
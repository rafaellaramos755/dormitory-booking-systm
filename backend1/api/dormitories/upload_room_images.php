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

$dormitory_id = $_POST['dormitory_id'] ?? null;
$room_id = $_POST['room_id'] ?? null;
$room_name = $_POST['room_name'] ?? null;

if (!$dormitory_id || !$room_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID and room ID required"]);
    exit();
}

$check = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
$check->execute([$dormitory_id, $_SESSION['user_id']]);
if (!$check->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
    exit();
}

if (!isset($_FILES['images'])) {
    echo json_encode(["success" => false, "message" => "No images uploaded"]);
    exit();
}

$upload_dir = "../../uploads/rooms/";
if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

$uploadedCount = 0;
foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
    if ($_FILES['images']['error'][$key] !== UPLOAD_ERR_OK) continue;
    $ext = strtolower(pathinfo($_FILES['images']['name'][$key], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg','jpeg','png','gif','webp'])) continue;
    $filename = "room_" . $room_id . "_" . time() . "_" . $key . "." . $ext;
    if (move_uploaded_file($tmp_name, $upload_dir . $filename)) {
        $stmt = $pdo->prepare("INSERT INTO dormitory_images (dormitory_id, room_id, room_name, image_url) VALUES (?, ?, ?, ?)");
        $stmt->execute([$dormitory_id, $room_id, $room_name, "uploads/rooms/" . $filename]);
        $uploadedCount++;
    }
}
echo json_encode(["success" => true, "uploaded" => $uploadedCount]);
?>
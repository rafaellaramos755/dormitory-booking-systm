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
if (!$dormitory_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

$room_id = $_POST['room_id'] ?? null;
$room_name = $_POST['room_name'] ?? null;

$checkStmt = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
$checkStmt->execute([$dormitory_id, $_SESSION['user_id']]);
if (!$checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
    exit();
}

if (!isset($_FILES['images'])) {
    echo json_encode(["success" => false, "message" => "No images uploaded"]);
    exit();
}

$upload_dir = "../../uploads/dormitories/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$uploadedCount = 0;

foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
    if ($_FILES['images']['error'][$key] !== UPLOAD_ERR_OK) {
        continue;
    }
    
    $extension = strtolower(pathinfo($_FILES['images']['name'][$key], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($extension, $allowed)) {
        continue;
    }
    
    $filename = "dorm_" . $dormitory_id . "_" . time() . "_" . $key . "." . $extension;
    $filepath = $upload_dir . $filename;
    
    if (move_uploaded_file($tmp_name, $filepath)) {
        $is_featured = ($uploadedCount == 0) ? 1 : 0;
        $stmt = $pdo->prepare("INSERT INTO dormitory_images (dormitory_id, image_url, is_featured, room_id, room_name) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$dormitory_id, "uploads/dormitories/" . $filename, $is_featured, $room_id, $room_name]);
        $uploadedCount++;
    }
}

echo json_encode(["success" => true, "uploaded" => $uploadedCount]);
?>
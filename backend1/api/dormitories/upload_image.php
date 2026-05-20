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

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "Image required"]);
    exit();
}

$dormitory_id = $_POST['dormitory_id'] ?? null;
if (!$dormitory_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

// Check if dormitory belongs to owner
$checkStmt = $pdo->prepare("SELECT id FROM dormitories WHERE id = ? AND owner_id = ?");
$checkStmt->execute([$dormitory_id, $_SESSION['user_id']]);
if (!$checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
    exit();
}

$upload_dir = "../../uploads/dormitories/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($extension, $allowed)) {
    echo json_encode(["success" => false, "message" => "Invalid file type. Allowed: jpg, jpeg, png, gif, webp"]);
    exit();
}

$filename = "dorm_" . $dormitory_id . "_" . time() . "." . $extension;
$filepath = $upload_dir . $filename;

if (move_uploaded_file($_FILES['image']['tmp_name'], $filepath)) {
    $stmt = $pdo->prepare("UPDATE dormitories SET image_url = ? WHERE id = ?");
    $stmt->execute(["uploads/dormitories/" . $filename, $dormitory_id]);
    
    echo json_encode(["success" => true, "message" => "Image uploaded successfully", "image_url" => "uploads/dormitories/" . $filename]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to upload image"]);
}
?>
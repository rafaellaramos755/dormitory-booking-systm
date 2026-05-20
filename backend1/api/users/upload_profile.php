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
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

require_once "../../config/db.php";

if (!isset($_FILES['profile_image']) || $_FILES['profile_image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "Image required"]);
    exit();
}

$upload_dir = "../../uploads/profiles/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$extension = strtolower(pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($extension, $allowed)) {
    echo json_encode(["success" => false, "message" => "Invalid file type. Allowed: jpg, jpeg, png, gif, webp"]);
    exit();
}

$filename = "user_" . $_SESSION['user_id'] . "_" . time() . "." . $extension;
$filepath = $upload_dir . $filename;

if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $filepath)) {
    // Delete old profile image if exists
    $stmt = $pdo->prepare("SELECT profile_image FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $old = $stmt->fetch();
    if ($old && $old['profile_image'] && file_exists("../../" . $old['profile_image'])) {
        unlink("../../" . $old['profile_image']);
    }
    
    // Update database
    $stmt = $pdo->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
    $stmt->execute(["uploads/profiles/" . $filename, $_SESSION['user_id']]);
    
    echo json_encode(["success" => true, "message" => "Profile image uploaded", "image_url" => "uploads/profiles/" . $filename]);
} else {
    echo json_encode(["success" => false, "message" => "Upload failed"]);
}
?>
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

if (!isset($_FILES['qr_image']) || $_FILES['qr_image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "QR image required"]);
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

$upload_dir = "../../uploads/qr_codes/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$extension = strtolower(pathinfo($_FILES['qr_image']['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
if (!in_array($extension, $allowed)) {
    echo json_encode(["success" => false, "message" => "Invalid file type"]);
    exit();
}

$filename = "owner_qr_" . $dormitory_id . "_" . time() . "." . $extension;
$filepath = $upload_dir . $filename;

if (move_uploaded_file($_FILES['qr_image']['tmp_name'], $filepath)) {
    // First, check if qr_code_url column exists, if not add it
    try {
        $checkColumn = $pdo->query("SHOW COLUMNS FROM dormitories LIKE 'qr_code_url'");
        if ($checkColumn->rowCount() == 0) {
            $pdo->exec("ALTER TABLE dormitories ADD COLUMN qr_code_url VARCHAR(500) DEFAULT NULL");
        }
    } catch (Exception $e) {
        // Column might already exist
    }
    
    $stmt = $pdo->prepare("UPDATE dormitories SET qr_code_url = ? WHERE id = ?");
    $stmt->execute(["uploads/qr_codes/" . $filename, $dormitory_id]);
    
    echo json_encode(["success" => true, "message" => "QR code uploaded successfully", "qr_url" => "uploads/qr_codes/" . $filename]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to upload QR code"]);
}
?>
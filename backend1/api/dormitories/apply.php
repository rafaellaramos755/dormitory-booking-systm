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
    echo json_encode(["success" => false, "message" => "Unauthorized. Owner only."]);
    exit();
}

require_once "../../config/db.php";

// ✅ FIX: Get data from $_POST (for FormData), NOT from php://input
$name = $_POST['name'] ?? '';
$location = $_POST['location'] ?? '';
$description = $_POST['description'] ?? '';
$price_per_month = $_POST['price_per_month'] ?? '';
$deposit_amount = $_POST['deposit_amount'] ?? 0;
$total_rooms = $_POST['total_rooms'] ?? '';
$capacity = $_POST['capacity'] ?? 1;

// ✅ Validate required fields
$required = ['name', 'location', 'price_per_month', 'total_rooms'];
foreach ($required as $field) {
    if (empty($_POST[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit();
    }
}

// Helper function to upload a file
function uploadFile($fileKey, $prefix, $dormitoryId, $allowed = ['jpg','jpeg','png','pdf','doc','docx']) {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $upload_dir = "../../uploads/proofs/";
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
    $ext = strtolower(pathinfo($_FILES[$fileKey]['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) return null;
    $filename = $prefix . "_" . $dormitoryId . "_" . time() . "." . $ext;
    if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $upload_dir . $filename)) {
        return "uploads/proofs/" . $filename;
    }
    return null;
}

// Insert the application
$stmt = $pdo->prepare("INSERT INTO dorm_applications (owner_id, name, description, location, price_per_month, deposit_amount, total_rooms, capacity_per_room, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
$stmt->execute([
    $_SESSION['user_id'],
    $name,
    $description,
    $location,
    $price_per_month,
    $deposit_amount,
    $total_rooms,
    $capacity,
    null
]);
$appId = $pdo->lastInsertId();

// Upload each document
$businessPermit = uploadFile('business_permit', 'business', $appId);
$barangayClearance = uploadFile('barangay_clearance', 'barangay', $appId);
$govId = uploadFile('gov_id', 'govid', $appId);
$utilityBill = uploadFile('utility_bill', 'utility', $appId);

// Optional dorm image
$image_url = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $img_dir = "../../uploads/dormitories/";
    if (!is_dir($img_dir)) mkdir($img_dir, 0777, true);
    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    if (in_array($ext, ['jpg','jpeg','png','gif','webp'])) {
        $img_filename = "dorm_" . $appId . "_" . time() . "." . $ext;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $img_dir . $img_filename)) {
            $image_url = "uploads/dormitories/" . $img_filename;
        }
    }
}

// Update the application with document paths and image
$update = $pdo->prepare("UPDATE dorm_applications SET business_permit = ?, barangay_clearance = ?, gov_id = ?, utility_bill = ?, image_url = ? WHERE id = ?");
$update->execute([$businessPermit, $barangayClearance, $govId, $utilityBill, $image_url, $appId]);

if ($appId) {
    echo json_encode(["success" => true, "message" => "Application submitted. Admin will review it."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to submit application"]);
}
?>
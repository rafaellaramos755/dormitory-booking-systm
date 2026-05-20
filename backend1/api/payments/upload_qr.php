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
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'tenant') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

require_once "../../config/db.php";

$booking_id = isset($_POST['booking_id']) ? (int)$_POST['booking_id'] : 0;
$amount = isset($_POST['amount']) ? (float)$_POST['amount'] : 0;
$payment_type = isset($_POST['payment_type']) ? $_POST['payment_type'] : 'initial';
$payment_month = isset($_POST['payment_month']) ? $_POST['payment_month'] : date('Y-m-d');

if (!$booking_id) {
    echo json_encode(["success" => false, "message" => "Booking ID required"]);
    exit();
}

if (!isset($_FILES['qr_image']) || $_FILES['qr_image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "Please select an image"]);
    exit();
}

$upload_dir = "../../uploads/payments/";
if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

$ext = pathinfo($_FILES['qr_image']['name'], PATHINFO_EXTENSION);
$filename = "payment_" . $booking_id . "_" . time() . "." . $ext;
$filepath = $upload_dir . $filename;

if (move_uploaded_file($_FILES['qr_image']['tmp_name'], $filepath)) {
    $image_url = "uploads/payments/" . $filename;
    $stmt = $pdo->prepare("INSERT INTO payments (booking_id, amount, payment_type, payment_month, qr_code_image, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', NOW())");
    $result = $stmt->execute([$booking_id, $amount, $payment_type, $payment_month, $image_url]);
    
    if ($result) {
        echo json_encode(["success" => true, "message" => "Payment uploaded"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Upload failed"]);
}
?>
<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'tenant') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Tenant only."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['booking_id']) || empty($data['amount'])) {
    echo json_encode(["success" => false, "message" => "Booking ID and amount required"]);
    exit();
}

// Check if booking belongs to this tenant and is accepted
$checkStmt = $pdo->prepare("SELECT b.*, d.price_per_month, d.deposit_amount
                            FROM bookings b 
                            JOIN rooms r ON b.room_id = r.id 
                            JOIN dormitories d ON r.dormitory_id = d.id 
                            WHERE b.id = ? AND b.tenant_id = ? AND b.status = 'accepted'");
$checkStmt->execute([$data['booking_id'], $_SESSION['user_id']]);
$booking = $checkStmt->fetch();

if (!$booking) {
    echo json_encode(["success" => false, "message" => "Invalid booking or booking not accepted yet"]);
    exit();
}

$payment_type = $data['payment_type'] ?? 'initial';
$payment_month = $data['payment_month'] ?? date('Y-m-d');

// Check if initial payment already exists
if ($payment_type === 'initial') {
    $dupStmt = $pdo->prepare("SELECT id FROM payments WHERE booking_id = ? AND payment_type = 'initial'");
    $dupStmt->execute([$data['booking_id']]);
    if ($dupStmt->fetch()) {
        echo json_encode(["success" => false, "message" => "Initial payment already exists"]);
        exit();
    }
}

$sql = "INSERT INTO payments (booking_id, tenant_id, amount, payment_type, payment_month, status) 
        VALUES (?, ?, ?, ?, ?, 'pending')";

$stmt = $pdo->prepare($sql);
$result = $stmt->execute([
    $data['booking_id'],
    $_SESSION['user_id'],
    $data['amount'],
    $payment_type,
    $payment_month
]);

if ($result) {
    $payment_id = $pdo->lastInsertId();
    
    echo json_encode([
        "success" => true,
        "message" => "Payment created. Please upload QR code.",
        "payment_id" => $payment_id
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to create payment"]);
}
?>
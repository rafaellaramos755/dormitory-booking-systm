<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "../../config/db.php";

$dormitory_id = $_GET['dormitory_id'] ?? null;
if (!$dormitory_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

$stmt = $pdo->prepare("SELECT terms_text FROM dormitories WHERE id = ?");
$stmt->execute([$dormitory_id]);
$terms = $stmt->fetchColumn();

// Default terms if none set
if (!$terms) {
    $terms = "DORMITORY BOOKING TERMS AND CONDITIONS\n\n1. PAYMENT TERMS\nMonthly rent is due on or before the 5th day of each month. Late payment penalty: ₱50 per day after due date.\n\n2. SECURITY DEPOSIT\nA security deposit of ₱{deposit} is required. Refundable upon move-out, subject to inspection.\n\n3. MOVE-IN PAYMENT\n1 Month Advance Rent + Security Deposit.\n\n4. MONTHLY RENT (starting 2nd month)\nMonthly rent amount.\n\n5. CANCELLATION POLICY\nCancellation before move-in: Full refund of deposit. Cancellation after move-in: Deposit forfeited.\n\n6. MOVE-OUT REQUIREMENTS\n30 days written notice required before moving out. Deposit will be applied to last month's rent.";
}

echo json_encode(["success" => true, "terms" => $terms]);
?>
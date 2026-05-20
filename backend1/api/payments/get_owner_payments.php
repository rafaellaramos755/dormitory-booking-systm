<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Owner only."]);
    exit();
}

$status = $_GET['status'] ?? null;
$dormitory_id = $_GET['dormitory_id'] ?? null;

$sql = "SELECT p.*, 
        u.id as tenant_id, u.name as tenant_name, u.email as tenant_email, u.phone as tenant_phone,
        d.id as dormitory_id, d.name as dormitory_name,
        r.room_number,
        b.move_in_date
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN users u ON b.tenant_id = u.id
        JOIN rooms r ON b.room_id = r.id
        JOIN dormitories d ON r.dormitory_id = d.id
        WHERE b.owner_id = ?";

$params = [$_SESSION['user_id']];

if ($status) {
    $sql .= " AND p.status = ?";
    $params[] = $status;
}

if ($dormitory_id) {
    $sql .= " AND d.id = ?";
    $params[] = $dormitory_id;
}

$sql .= " ORDER BY p.created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$payments = $stmt->fetchAll();

// Calculate summary
$total_verified = 0;
$total_pending = 0;
$total_failed = 0;

foreach ($payments as $payment) {
    if ($payment['status'] === 'verified') {
        $total_verified += $payment['amount'];
    } elseif ($payment['status'] === 'pending') {
        $total_pending += $payment['amount'];
    } elseif ($payment['status'] === 'failed') {
        $total_failed += $payment['amount'];
    }
}

echo json_encode([
    "success" => true,
    "data" => $payments,
    "summary" => [
        "total_verified" => $total_verified,
        "total_pending" => $total_pending,
        "total_failed" => $total_failed
    ]
]);
?>
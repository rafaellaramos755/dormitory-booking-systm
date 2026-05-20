<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

$status = $_GET['status'] ?? null;

$sql = "SELECT p.*, 
        b.move_in_date, b.due_date,
        d.id as dormitory_id, d.name as dormitory_name, d.location,
        r.room_number
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN rooms r ON b.room_id = r.id
        JOIN dormitories d ON r.dormitory_id = d.id
        WHERE p.tenant_id = ?";

$params = [$_SESSION['user_id']];

if ($status) {
    $sql .= " AND p.status = ?";
    $params[] = $status;
}

$sql .= " ORDER BY p.created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$payments = $stmt->fetchAll();

// Calculate total paid and pending amounts
$total_paid = 0;
$total_pending = 0;

foreach ($payments as $payment) {
    if ($payment['status'] === 'verified') {
        $total_paid += $payment['amount'];
    } elseif ($payment['status'] === 'pending') {
        $total_pending += $payment['amount'];
    }
}

echo json_encode([
    "success" => true, 
    "data" => $payments,
    "summary" => [
        "total_paid" => $total_paid,
        "total_pending" => $total_pending
    ]
]);
?>
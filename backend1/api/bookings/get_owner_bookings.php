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

$sql = "SELECT b.*, 
        r.room_number, 
        d.id as dormitory_id, d.name as dormitory_name,
        u.id as tenant_id, u.name as tenant_name, u.email as tenant_email, u.phone as tenant_phone,
        (SELECT COUNT(*) FROM payments WHERE booking_id = b.id AND status = 'verified') as payments_made,
        (SELECT SUM(amount) FROM payments WHERE booking_id = b.id AND status = 'verified') as total_paid
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN dormitories d ON r.dormitory_id = d.id
        JOIN users u ON b.tenant_id = u.id
        WHERE b.owner_id = ?";

$params = [$_SESSION['user_id']];

if ($status) {
    $sql .= " AND b.status = ?";
    $params[] = $status;
}

if ($dormitory_id) {
    $sql .= " AND d.id = ?";
    $params[] = $dormitory_id;
}

$sql .= " ORDER BY b.move_out_requested DESC, b.created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$bookings = $stmt->fetchAll();

echo json_encode(["success" => true, "data" => $bookings]);
?>
<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT b.*, 
        r.room_number, 
        d.id as dormitory_id, 
        d.name as dormitory_name, 
        d.location, 
        d.price_per_month,
        d.deposit_amount,
        d.qr_code_url,
        u.name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN dormitories d ON r.dormitory_id = d.id
        JOIN users u ON d.owner_id = u.id
        WHERE b.tenant_id = ?
        ORDER BY b.created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id]);
$bookings = $stmt->fetchAll();

foreach ($bookings as &$booking) {
    if ($booking['status'] == 'accepted') {
        $today = new DateTime();
        $due = new DateTime($booking['due_date']);
        $days_left = $today->diff($due)->days;
        $booking['days_left'] = $due < $today ? 0 : $days_left;
        $booking['is_overdue'] = $due < $today;
    }
}

echo json_encode(["success" => true, "data" => $bookings]);
?>
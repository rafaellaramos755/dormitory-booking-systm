<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: text/csv; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    die("Unauthorized");
}

require_once "../../config/db.php";

$owner_id = $_SESSION['user_id'];

$stmt = $pdo->prepare("
    SELECT 
        b.id AS booking_id,
        d.name AS dormitory_name,
        r.room_number,
        u.name AS tenant_name,
        u.email AS tenant_email,
        b.move_in_date,
        b.due_date,
        b.status,
        COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id AND status = 'verified'), 0) AS total_paid
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN dormitories d ON r.dormitory_id = d.id
    JOIN users u ON b.tenant_id = u.id
    WHERE b.owner_id = ?
    ORDER BY b.created_at DESC
");
$stmt->execute([$owner_id]);
$bookings = $stmt->fetchAll();

header('Content-Disposition: attachment; filename="bookings_export.csv"');
$output = fopen('php://output', 'w');
fputcsv($output, ['Booking ID', 'Dormitory', 'Room', 'Tenant Name', 'Tenant Email', 'Move-in Date', 'Due Date', 'Status', 'Total Paid (₱)']);

foreach ($bookings as $row) {
    fputcsv($output, [
        $row['booking_id'],
        $row['dormitory_name'],
        $row['room_number'],
        $row['tenant_name'],
        $row['tenant_email'],
        $row['move_in_date'],
        $row['due_date'],
        $row['status'],
        $row['total_paid']
    ]);
}
fclose($output);
exit;
?>
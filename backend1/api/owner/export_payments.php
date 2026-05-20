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
        p.id AS payment_id,
        d.name AS dormitory_name,
        r.room_number,
        u.name AS tenant_name,
        u.email AS tenant_email,
        p.amount,
        p.payment_type,
        p.payment_month,
        p.status,
        p.created_at AS payment_date,
        p.verified_at
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN rooms r ON b.room_id = r.id
    JOIN dormitories d ON r.dormitory_id = d.id
    JOIN users u ON b.tenant_id = u.id
    WHERE b.owner_id = ?
    ORDER BY p.created_at DESC
");
$stmt->execute([$owner_id]);
$payments = $stmt->fetchAll();

header('Content-Disposition: attachment; filename="payments_export.csv"');
$output = fopen('php://output', 'w');
fputcsv($output, ['Payment ID', 'Dormitory', 'Room', 'Tenant Name', 'Tenant Email', 'Amount (₱)', 'Payment Type', 'For Month', 'Status', 'Payment Date', 'Verified Date']);

foreach ($payments as $row) {
    fputcsv($output, [
        $row['payment_id'],
        $row['dormitory_name'],
        $row['room_number'],
        $row['tenant_name'],
        $row['tenant_email'],
        $row['amount'],
        $row['payment_type'],
        $row['payment_month'],
        $row['status'],
        $row['payment_date'],
        $row['verified_at'] ?? ''
    ]);
}
fclose($output);
exit;
?>
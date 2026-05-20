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
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = $data['booking_id'] ?? null;

if (!$booking_id) {
    echo json_encode(["success" => false, "message" => "Booking ID required"]);
    exit();
}

// Get booking details with tenant info
$getBooking = $pdo->prepare("SELECT b.*, u.id as tenant_id, u.name as tenant_name, d.name as dorm_name, r.room_number 
                              FROM bookings b
                              JOIN users u ON b.tenant_id = u.id
                              JOIN rooms r ON b.room_id = r.id
                              JOIN dormitories d ON r.dormitory_id = d.id
                              WHERE b.id = ? AND b.owner_id = ?");
$getBooking->execute([$booking_id, $_SESSION['user_id']]);
$booking = $getBooking->fetch();

if (!$booking) {
    echo json_encode(["success" => false, "message" => "Booking not found"]);
    exit();
}

// Update booking status to accepted
$stmt = $pdo->prepare("UPDATE bookings SET status = 'accepted', updated_at = NOW() WHERE id = ? AND owner_id = ?");
$result = $stmt->execute([$booking_id, $_SESSION['user_id']]);

if ($result) {
    // Send notification to tenant with full message
    $notifMessage = "Good news! Your booking request for {$booking['dorm_name']} - Room {$booking['room_number']} has been APPROVED. Move-in date: {$booking['move_in_date']}. Please proceed with the move-in payment to confirm your reservation.";
    
    $notifSql = "INSERT INTO notifications (user_id, title, message, type, created_at) 
                 VALUES (?, 'Booking Approved', ?, 'booking', NOW())";
    $notifStmt = $pdo->prepare($notifSql);
    $notifStmt->execute([$booking['tenant_id'], $notifMessage]);
    
    echo json_encode(["success" => true, "message" => "Booking approved"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to approve booking"]);
}
?>
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

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = $data['booking_id'] ?? null;
$move_out_date = $data['move_out_date'] ?? null;

if (!$booking_id || !$move_out_date) {
    echo json_encode(["success" => false, "message" => "Booking ID and move-out date required"]);
    exit();
}

// Check if booking belongs to tenant and is accepted
$checkStmt = $pdo->prepare("SELECT b.*, d.name as dormitory_name, d.owner_id 
                            FROM bookings b 
                            JOIN rooms r ON b.room_id = r.id 
                            JOIN dormitories d ON r.dormitory_id = d.id 
                            WHERE b.id = ? AND b.tenant_id = ? AND b.status = 'accepted'");
$checkStmt->execute([$booking_id, $_SESSION['user_id']]);
$booking = $checkStmt->fetch();

if (!$booking) {
    echo json_encode(["success" => false, "message" => "Invalid booking or booking not accepted"]);
    exit();
}

// Update booking with move-out request
$stmt = $pdo->prepare("UPDATE bookings SET move_out_requested = TRUE, move_out_date = ? WHERE id = ?");
$result = $stmt->execute([$move_out_date, $booking_id]);

if ($result) {
    // Create notification for owner
    $notifSql = "INSERT INTO notifications (user_id, title, message, type) 
                 VALUES (?, 'Move-Out Request', ?, 'booking')";
    $notifStmt = $pdo->prepare($notifSql);
    $notifStmt->execute([$booking['owner_id'], "Tenant has requested move-out on " . $move_out_date]);
    
    echo json_encode(["success" => true, "message" => "Move-out request submitted"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to submit request"]);
}
?>
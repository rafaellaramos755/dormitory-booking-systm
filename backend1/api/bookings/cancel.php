<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = $data['booking_id'] ?? $_GET['id'] ?? null;

if (!$booking_id) {
    echo json_encode(["success" => false, "message" => "Booking ID required"]);
    exit();
}

// Get booking details
$bookingStmt = $pdo->prepare("SELECT b.*, r.dormitory_id, b.tenant_id, r.room_id
                              FROM bookings b 
                              JOIN rooms r ON b.room_id = r.id 
                              WHERE b.id = ?");
$bookingStmt->execute([$booking_id]);
$booking = $bookingStmt->fetch();

if (!$booking) {
    echo json_encode(["success" => false, "message" => "Booking not found"]);
    exit();
}

// Check if user owns this booking
if ($_SESSION['user_type'] === 'tenant' && $booking['tenant_id'] != $_SESSION['user_id']) {
    echo json_encode(["success" => false, "message" => "You can only cancel your own bookings"]);
    exit();
}

if ($_SESSION['user_type'] === 'owner' && $booking['owner_id'] != $_SESSION['user_id']) {
    echo json_encode(["success" => false, "message" => "You don't own this booking"]);
    exit();
}

// Only pending or accepted bookings can be cancelled
if (!in_array($booking['status'], ['pending', 'accepted'])) {
    echo json_encode(["success" => false, "message" => "This booking cannot be cancelled anymore"]);
    exit();
}

try {
    $pdo->beginTransaction();
    
    if ($booking['status'] == 'accepted') {
        // Remove tenant from room
        $getRoomStmt = $pdo->prepare("SELECT tenant_ids FROM rooms WHERE id = ?");
        $getRoomStmt->execute([$booking['room_id']]);
        $room = $getRoomStmt->fetch();
        $tenantIds = $room['tenant_ids'] ? json_decode($room['tenant_ids'], true) : [];
        $tenantIds = array_filter($tenantIds, function($id) use ($booking) {
            return $id != $booking['tenant_id'];
        });
        $updateRoomStmt = $pdo->prepare("UPDATE rooms SET tenant_ids = ? WHERE id = ?");
        $updateRoomStmt->execute([json_encode(array_values($tenantIds)), $booking['room_id']]);
        
        // Update room occupancy
        $roomStmt = $pdo->prepare("UPDATE rooms SET current_occupants = current_occupants - 1, 
                                   is_available = TRUE 
                                   WHERE id = ?");
        $roomStmt->execute([$booking['room_id']]);
        
        $dormStmt = $pdo->prepare("UPDATE dormitories SET available_rooms = available_rooms + 1 WHERE id = ?");
        $dormStmt->execute([$booking['dormitory_id']]);
    }
    
    $stmt = $pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?");
    $result = $stmt->execute([$booking_id]);
    
    if ($result) {
        $notifSql = "INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Booking Cancelled', 'A booking has been cancelled.', 'booking')";
        $notifStmt = $pdo->prepare($notifSql);
        
        if ($_SESSION['user_type'] === 'tenant') {
            $notifStmt->execute([$booking['owner_id']]);
        } else {
            $notifStmt->execute([$booking['tenant_id']]);
        }
        
        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Booking cancelled successfully"]);
    } else {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Failed to cancel booking"]);
    }
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
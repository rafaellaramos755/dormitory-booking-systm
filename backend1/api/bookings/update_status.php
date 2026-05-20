<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'owner') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Owner only."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['booking_id']) || empty($data['status'])) {
    echo json_encode(["success" => false, "message" => "Booking ID and status required"]);
    exit();
}

$allowed_status = ['accepted', 'declined', 'completed'];
if (!in_array($data['status'], $allowed_status)) {
    echo json_encode(["success" => false, "message" => "Invalid status"]);
    exit();
}

// Get booking details
$bookingStmt = $pdo->prepare("SELECT b.*, r.dormitory_id, r.room_number, r.capacity, d.price_per_month, d.deposit_amount, d.advance_months
                              FROM bookings b 
                              JOIN rooms r ON b.room_id = r.id 
                              JOIN dormitories d ON r.dormitory_id = d.id
                              WHERE b.id = ? AND b.owner_id = ?");
$bookingStmt->execute([$data['booking_id'], $_SESSION['user_id']]);
$booking = $bookingStmt->fetch();

if (!$booking) {
    echo json_encode(["success" => false, "message" => "Booking not found or you don't own this"]);
    exit();
}

try {
    $pdo->beginTransaction();
    
    $sql = "UPDATE bookings SET status = ? WHERE id = ? AND owner_id = ?";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$data['status'], $data['booking_id'], $_SESSION['user_id']]);
    
    if ($result) {
        if ($data['status'] == 'accepted') {
            // Save terms acceptance
            if (isset($data['terms_accepted']) && $data['terms_accepted'] == true) {
                $termsStmt = $pdo->prepare("UPDATE bookings SET terms_accepted = ?, terms_accepted_date = NOW() WHERE id = ?");
                $termsStmt->execute([1, $data['booking_id']]);
            }
            
            // Update room current occupants
            $roomStmt = $pdo->prepare("UPDATE rooms SET current_occupants = current_occupants + 1, 
                                       is_available = (current_occupants + 1 < capacity) 
                                       WHERE id = ?");
            $roomStmt->execute([$booking['room_id']]);
            
            // Add tenant to room's tenant_ids
            $getRoomStmt = $pdo->prepare("SELECT tenant_ids FROM rooms WHERE id = ?");
            $getRoomStmt->execute([$booking['room_id']]);
            $room = $getRoomStmt->fetch();
            $tenantIds = $room['tenant_ids'] ? json_decode($room['tenant_ids'], true) : [];
            if (!in_array($booking['tenant_id'], $tenantIds)) {
                $tenantIds[] = $booking['tenant_id'];
                $updateRoomStmt = $pdo->prepare("UPDATE rooms SET tenant_ids = ? WHERE id = ?");
                $updateRoomStmt->execute([json_encode($tenantIds), $booking['room_id']]);
            }
            
            // Update available rooms in dormitory
            $dormStmt = $pdo->prepare("UPDATE dormitories SET available_rooms = available_rooms - 1 WHERE id = ?");
            $dormStmt->execute([$booking['dormitory_id']]);
            
            // Calculate initial payment = 1 month advance + deposit
            $initialPayment = $booking['price_per_month'] + ($booking['deposit_amount'] ?? 0);
            
            // Create payment record for initial payment
            $paymentStmt = $pdo->prepare("INSERT INTO payments (booking_id, tenant_id, amount, payment_type, payment_month, status) 
                                          VALUES (?, ?, ?, 'initial', ?, 'pending')");
            $paymentStmt->execute([
                $data['booking_id'],
                $booking['tenant_id'],
                $initialPayment,
                date('Y-m-01')
            ]);
            
            // Create notification for tenant
            $notifSql = "INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Booking Accepted', 'Your booking has been accepted! Total initial payment: ₱' || ?, 'booking')";
            $notifStmt = $pdo->prepare($notifSql);
            $notifStmt->execute([$booking['tenant_id'], $initialPayment]);
        } 
        elseif ($data['status'] == 'declined') {
            $declineReason = $data['decline_reason'] ?? 'No reason provided';
            $reasonStmt = $pdo->prepare("UPDATE bookings SET decline_reason = ? WHERE id = ?");
            $reasonStmt->execute([$declineReason, $data['booking_id']]);
            
            $notifSql = "INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Booking Declined', ?, 'booking')";
            $notifStmt = $pdo->prepare($notifSql);
            $notifStmt->execute([$booking['tenant_id'], "Your booking request was declined. Reason: " . $declineReason]);
        }
        elseif ($data['status'] == 'completed') {
            if (isset($data['feedback']) && !empty($data['feedback'])) {
                $feedbackStmt = $pdo->prepare("UPDATE bookings SET feedback = ?, feedback_date = NOW() WHERE id = ?");
                $feedbackStmt->execute([$data['feedback'], $data['booking_id']]);
            }
            
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
            
            // Update available rooms in dormitory
            $dormStmt = $pdo->prepare("UPDATE dormitories SET available_rooms = available_rooms + 1 WHERE id = ?");
            $dormStmt->execute([$booking['dormitory_id']]);
        }
        
        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Booking " . $data['status'] . " successfully"]);
    } else {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Failed to update booking status"]);
    }
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
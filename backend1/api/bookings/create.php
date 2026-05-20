<?php
require_once "../../config/db.php";
session_start();

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'tenant') {
    echo json_encode(["success" => false, "message" => "Unauthorized. Tenant only."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['room_id']) || empty($data['move_in_date'])) {
    echo json_encode(["success" => false, "message" => "Room ID and move-in date required"]);
    exit();
}

// Check if room is available
$roomStmt = $pdo->prepare("SELECT r.*, d.owner_id, d.price_per_month, d.name as dormitory_name 
                           FROM rooms r 
                           JOIN dormitories d ON r.dormitory_id = d.id 
                           WHERE r.id = ? AND r.is_available = 1");
$roomStmt->execute([$data['room_id']]);
$room = $roomStmt->fetch();

if (!$room) {
    echo json_encode(["success" => false, "message" => "Room is not available"]);
    exit();
}

// Check if tenant already has pending booking for this room
$checkStmt = $pdo->prepare("SELECT id FROM bookings WHERE room_id = ? AND tenant_id = ? AND status IN ('pending', 'accepted')");
$checkStmt->execute([$data['room_id'], $_SESSION['user_id']]);
if ($checkStmt->fetch()) {
    echo json_encode(["success" => false, "message" => "You already have a pending or accepted booking for this room"]);
    exit();
}

// Calculate due date (1 month from move in)
$due_date = date('Y-m-d', strtotime($data['move_in_date'] . ' + 1 month'));

try {
    $pdo->beginTransaction();
    
    $sql = "INSERT INTO bookings (room_id, tenant_id, owner_id, move_in_date, due_date, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $data['room_id'],
        $_SESSION['user_id'],
        $room['owner_id'],
        $data['move_in_date'],
        $due_date
    ]);
    
    if ($result) {
        $booking_id = $pdo->lastInsertId();
        
        // ✅ FIXED: Notification message with full details
        $tenantName = $_SESSION['user_name'] ?? 'A tenant';
        $notifMessage = $tenantName . " has requested to book " . $room['dormitory_name'] . " - Room " . $room['room_number'] . ". Move-in date: " . $data['move_in_date'] . ". Please review and approve/decline the request.";
        
        $notifSql = "INSERT INTO notifications (user_id, title, message, type, created_at) 
                     VALUES (?, 'New Booking Request', ?, 'booking', NOW())";
        $notifStmt = $pdo->prepare($notifSql);
        $notifStmt->execute([$room['owner_id'], $notifMessage]);
        
        $pdo->commit();
        
        echo json_encode([
            "success" => true,
            "message" => "Booking request sent successfully",
            "booking_id" => $booking_id,
            "due_date" => $due_date
        ]);
    } else {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Failed to create booking"]);
    }
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
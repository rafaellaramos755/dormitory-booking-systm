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

if (empty($data['payment_id'])) {
    echo json_encode(["success" => false, "message" => "Payment ID required"]);
    exit();
}

$status = $data['status'] ?? 'verified';

// Check if payment belongs to owner's booking
$checkStmt = $pdo->prepare("SELECT p.*, b.tenant_id, b.id as booking_id 
                            FROM payments p 
                            JOIN bookings b ON p.booking_id = b.id 
                            WHERE p.id = ? AND b.owner_id = ?");
$checkStmt->execute([$data['payment_id'], $_SESSION['user_id']]);
$payment = $checkStmt->fetch();

if (!$payment) {
    echo json_encode(["success" => false, "message" => "Payment not found or you don't own this"]);
    exit();
}

if ($payment['status'] !== 'pending') {
    echo json_encode(["success" => false, "message" => "Payment already " . $payment['status']]);
    exit();
}

try {
    $pdo->beginTransaction();
    
    $sql = "UPDATE payments SET status = ?, verified_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$status, $data['payment_id']]);
    
    if ($result) {
        // Create notification for tenant
        $notifSql = "INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Payment Verified', 'Your payment has been verified. Thank you!', 'payment')";
        $notifStmt = $pdo->prepare($notifSql);
        $notifStmt->execute([$payment['tenant_id']]);
        
        // If this is monthly payment, update booking due date
        if ($payment['payment_type'] === 'monthly') {
            $newDueDate = date('Y-m-d', strtotime($payment['payment_month'] . ' + 2 months'));
            $updateBooking = $pdo->prepare("UPDATE bookings SET due_date = ? WHERE id = ?");
            $updateBooking->execute([$newDueDate, $payment['booking_id']]);
        }
        
        $pdo->commit();
        
        echo json_encode(["success" => true, "message" => "Payment verified successfully"]);
    } else {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => "Verification failed"]);
    }
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
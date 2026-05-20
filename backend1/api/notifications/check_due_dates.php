<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "../../config/db.php";
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit();
}

$user_id = $_SESSION['user_id'];

// Check for bookings with 7 days or less remaining
$stmt = $pdo->prepare("
    SELECT b.*, d.name as dormitory_name, r.room_number,
           DATEDIFF(b.due_date, CURDATE()) as days_left
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN dormitories d ON r.dormitory_id = d.id
    WHERE b.tenant_id = ? 
    AND b.status = 'accepted'
    AND b.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
");
$stmt->execute([$user_id]);
$upcomingBookings = $stmt->fetchAll();

$notificationsSent = 0;

foreach ($upcomingBookings as $booking) {
    $daysLeft = $booking['days_left'];
    $message = "";

    if ($daysLeft == 7) {
        $message = "⏰ Reminder: Your payment for {$booking['dormitory_name']} (Room {$booking['room_number']}) is due in 7 days.";
    } elseif ($daysLeft == 3) {
        $message = "⚠️ Reminder: Your payment for {$booking['dormitory_name']} (Room {$booking['room_number']}) is due in 3 days.";
    } elseif ($daysLeft == 1) {
        $message = "🔴 URGENT: Your payment for {$booking['dormitory_name']} (Room {$booking['room_number']}) is due TOMORROW!";
    } else {
        $message = "📅 Your payment for {$booking['dormitory_name']} (Room {$booking['room_number']}) is due in {$daysLeft} days.";
    }

    // Check if notification was already sent today for this booking
    $checkNotif = $pdo->prepare("
        SELECT id FROM notifications 
        WHERE user_id = ? AND booking_id = ? AND DATE(created_at) = CURDATE() AND type = 'due_date'
    ");
    $checkNotif->execute([$user_id, $booking['id']]);
    
    if ($checkNotif->rowCount() == 0) {
        // Insert notification
        $insertNotif = $pdo->prepare("
            INSERT INTO notifications (user_id, title, message, type, booking_id) 
            VALUES (?, 'Payment Due Soon', ?, 'due_date', ?)
        ");
        $insertNotif->execute([$user_id, $message, $booking['id']]);
        $notificationsSent++;
    }
}

echo json_encode([
    "success" => true,
    "notifications_sent" => $notificationsSent,
    "upcoming_count" => count($upcomingBookings)
]);
?>
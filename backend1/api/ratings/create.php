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

if (empty($data['dormitory_id']) || empty($data['rating'])) {
    echo json_encode(["success" => false, "message" => "Dormitory ID and rating required"]);
    exit();
}

if ($data['rating'] < 1 || $data['rating'] > 5) {
    echo json_encode(["success" => false, "message" => "Rating must be between 1 and 5"]);
    exit();
}

// Check if tenant has a completed booking for this dormitory
$checkStmt = $pdo->prepare("
    SELECT b.id FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE b.tenant_id = ? AND r.dormitory_id = ? AND b.status = 'completed'
    LIMIT 1
");
$checkStmt->execute([$_SESSION['user_id'], $data['dormitory_id']]);
$booking = $checkStmt->fetch();

if (!$booking) {
    echo json_encode(["success" => false, "message" => "You can only rate dormitories you have stayed in"]);
    exit();
}

// Insert or update rating
$sql = "INSERT INTO ratings (dormitory_id, tenant_id, rating, review) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = ?, review = ?";

$stmt = $pdo->prepare($sql);
$result = $stmt->execute([
    $data['dormitory_id'],
    $_SESSION['user_id'],
    $data['rating'],
    $data['review'] ?? null,
    $data['rating'],
    $data['review'] ?? null
]);

if ($result) {
    // Create notification for owner
    $ownerStmt = $pdo->prepare("SELECT owner_id FROM dormitories WHERE id = ?");
    $ownerStmt->execute([$data['dormitory_id']]);
    $owner = $ownerStmt->fetch();
    
    if ($owner) {
        $notifSql = "INSERT INTO notifications (user_id, title, message, type) 
                     VALUES (?, 'New Rating', 'Your dormitory received a ' . ? . ' star rating', 'system')";
        $notifStmt = $pdo->prepare($notifSql);
        $notifStmt->execute([$owner['owner_id'], $data['rating']]);
    }
    
    echo json_encode(["success" => true, "message" => "Rating submitted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to submit rating"]);
}
?>
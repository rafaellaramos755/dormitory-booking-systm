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
$dormitory_id = $data['dormitory_id'] ?? null;

if (!$dormitory_id) {
    echo json_encode(["success" => false, "message" => "Dormitory ID required"]);
    exit();
}

// Verify ownership
$check = $pdo->prepare("SELECT id, name FROM dormitories WHERE id = ? AND owner_id = ?");
$check->execute([$dormitory_id, $_SESSION['user_id']]);
$dorm = $check->fetch();
if (!$dorm) {
    echo json_encode(["success" => false, "message" => "You don't own this dormitory"]);
    exit();
}

// Check for active bookings (accepted or pending)
$bookingCheck = $pdo->prepare("
    SELECT COUNT(*) FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE r.dormitory_id = ? AND b.status IN ('pending', 'accepted')
");
$bookingCheck->execute([$dormitory_id]);
$activeBookings = $bookingCheck->fetchColumn();

// Check for current occupants (tenants currently staying)
$occupantCheck = $pdo->prepare("
    SELECT SUM(r.current_occupants) FROM rooms r WHERE r.dormitory_id = ?
");
$occupantCheck->execute([$dormitory_id]);
$currentOccupants = $occupantCheck->fetchColumn();

if ($activeBookings > 0 || $currentOccupants > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Cannot deactivate because there are active bookings or current occupants. Please resolve them first."
    ]);
    exit();
}

// Deactivate: update status to 'inactive'
$stmt = $pdo->prepare("UPDATE dormitories SET status = 'inactive' WHERE id = ?");
$result = $stmt->execute([$dormitory_id]);

if ($result) {
    // Notify tenants who have completed bookings? Or all tenants? We'll notify tenants with accepted/completed bookings in this dorm.
    $tenantStmt = $pdo->prepare("
        SELECT DISTINCT b.tenant_id FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE r.dormitory_id = ? AND b.status IN ('accepted', 'completed')
    ");
    $tenantStmt->execute([$dormitory_id]);
    $tenants = $tenantStmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tenants as $tenant_id) {
        $notifSql = "INSERT INTO notifications (user_id, title, message, type) 
                     VALUES (?, 'Dormitory Deactivated', ?, 'system')";
        $notifStmt = $pdo->prepare($notifSql);
        $notifStmt->execute([$tenant_id, "The dormitory '{$dorm['name']}' has been deactivated by the owner. Please contact owner for more information."]);
    }
    
    echo json_encode(["success" => true, "message" => "Dormitory deactivated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to deactivate"]);
}
?>
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
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$app_id = $data['application_id'] ?? null;

if (!$app_id) {
    echo json_encode(["success" => false, "message" => "Application ID required"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // Get application details
    $stmt = $pdo->prepare("SELECT * FROM dorm_applications WHERE id = ?");
    $stmt->execute([$app_id]);
    $app = $stmt->fetch();
    if (!$app) {
        throw new Exception("Application not found");
    }

    // Create dormitory from application
    $insertDorm = $pdo->prepare("INSERT INTO dormitories 
        (owner_id, name, description, location, price_per_month, deposit_amount, total_rooms, available_rooms, image_url, status, is_verified, verified_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, NOW())");
    $insertDorm->execute([
        $app['owner_id'],
        $app['name'],
        $app['description'],
        $app['location'],
        $app['price_per_month'],
        $app['deposit_amount'],
        $app['total_rooms'],
        $app['total_rooms'],
        $app['image_url']
    ]);
    $dorm_id = $pdo->lastInsertId();

    // Create rooms
    $capacity = $app['capacity_per_room'] ?? 1;
    for ($i = 1; $i <= $app['total_rooms']; $i++) {
        $roomSql = "INSERT INTO rooms (dormitory_id, room_number, capacity, current_occupants, is_available) VALUES (?, ?, ?, 0, 1)";
        $roomStmt = $pdo->prepare($roomSql);
        $roomStmt->execute([$dorm_id, "Room " . $i, $capacity]);
    }

    // Update application status
    $updateApp = $pdo->prepare("UPDATE dorm_applications SET status = 'approved', admin_remarks = ? WHERE id = ?");
    $updateApp->execute([$data['remarks'] ?? '', $app_id]);

    // Notify owner
    $notifSql = "INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Dormitory Approved', 'Your dormitory application has been approved. Your dorm is now listed.', 'system')";
    $notifStmt = $pdo->prepare($notifSql);
    $notifStmt->execute([$app['owner_id']]);

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Dormitory approved and created"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
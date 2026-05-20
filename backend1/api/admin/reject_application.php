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
$remarks = $data['remarks'] ?? '';

if (!$app_id) {
    echo json_encode(["success" => false, "message" => "Application ID required"]);
    exit();
}

$update = $pdo->prepare("UPDATE dorm_applications SET status = 'rejected', admin_remarks = ? WHERE id = ?");
$result = $update->execute([$remarks, $app_id]);

if ($result) {
    // Get owner_id
    $stmt = $pdo->prepare("SELECT owner_id FROM dorm_applications WHERE id = ?");
    $stmt->execute([$app_id]);
    $owner = $stmt->fetch();
    if ($owner) {
        $notifSql = "INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Dormitory Rejected', ?, 'system')";
        $notifStmt = $pdo->prepare($notifSql);
        $notifStmt->execute([$owner['owner_id'], "Your dormitory application was rejected. Reason: " . $remarks]);
    }
    echo json_encode(["success" => true, "message" => "Application rejected"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to reject"]);
}
?>
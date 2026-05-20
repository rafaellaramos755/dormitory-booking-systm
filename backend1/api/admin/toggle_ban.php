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
$user_id = $data['user_id'] ?? null;
$ban = isset($data['ban']) ? (bool)$data['ban'] : false;
$ban_reason = $data['ban_reason'] ?? '';

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit();
}

// Get user details for notification
$getUser = $pdo->prepare("SELECT name, email FROM users WHERE id = ?");
$getUser->execute([$user_id]);
$user = $getUser->fetch();

if ($ban) {
    // Ban user with reason
    $stmt = $pdo->prepare("UPDATE users SET is_banned = 1, ban_reason = ?, banned_at = NOW() WHERE id = ? AND user_type != 'admin'");
    $result = $stmt->execute([$ban_reason, $user_id]);
    if ($result) {
        // Send notification to banned user with proper message
        $banMessage = "Your account has been BANNED due to violation of our community guidelines. Reason: " . ($ban_reason ?: "Violation of terms") . ". If you believe this is a mistake, please contact support.";
        $notifSql = "INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, 'Account Banned', ?, 'system', NOW())";
        $notifStmt = $pdo->prepare($notifSql);
        $notifStmt->execute([$user_id, $banMessage]);
    }
} else {
    // Unban user
    $stmt = $pdo->prepare("UPDATE users SET is_banned = 0, ban_reason = NULL, banned_at = NULL WHERE id = ? AND user_type != 'admin'");
    $result = $stmt->execute([$user_id]);
    if ($result) {
        $unbanMessage = "Your account has been UNBANNED. You can now access the platform again. Please follow our community guidelines moving forward.";
        $notifSql = "INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, 'Account Unbanned', ?, 'system', NOW())";
        $notifStmt = $pdo->prepare($notifSql);
        $notifStmt->execute([$user_id, $unbanMessage]);
    }
}

echo json_encode(["success" => $result, "message" => $result ? "User updated" : "Update failed"]);
?>
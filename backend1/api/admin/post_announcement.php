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
$title = trim($data['title'] ?? '');
$content = trim($data['content'] ?? '');

if (empty($title) || empty($content)) {
    echo json_encode(["success" => false, "message" => "Title and content required"]);
    exit();
}

try {
    $pdo->beginTransaction();

    // Insert announcement
    $stmt = $pdo->prepare("INSERT INTO announcements (admin_id, title, content, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$_SESSION['user_id'], $title, $content]);

    // Send notification to all tenants and owners with proper message
    $users = $pdo->query("SELECT id FROM users WHERE user_type IN ('tenant', 'owner')")->fetchAll();
    $notifMessage = "New announcement: " . $title . " - " . $content;
    $notifSql = "INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, 'New Announcement', ?, 'system', NOW())";
    $notifStmt = $pdo->prepare($notifSql);
    foreach ($users as $user) {
        $notifStmt->execute([$user['id'], $notifMessage]);
    }

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Announcement posted and notifications sent"]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
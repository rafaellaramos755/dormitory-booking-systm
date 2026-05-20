<?php
// This is a helper file - not an API endpoint
// Other files can include this to send notifications

function sendNotification($pdo, $user_id, $title, $message, $type = 'system') {
    $sql = "INSERT INTO notifications (user_id, title, message, type, created_at) 
            VALUES (?, ?, ?, ?, NOW())";
    $stmt = $pdo->prepare($sql);
    return $stmt->execute([$user_id, $title, $message, $type]);
}

// If called directly as API
if (basename($_SERVER['SCRIPT_FILENAME']) == 'send.php') {
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
    
    if (empty($data['user_id']) || empty($data['title']) || empty($data['message'])) {
        echo json_encode(["success" => false, "message" => "User ID, title, and message required"]);
        exit();
    }
    
    $result = sendNotification($pdo, $data['user_id'], $data['title'], $data['message'], $data['type'] ?? 'system');
    
    echo json_encode(["success" => $result, "message" => $result ? "Notification sent" : "Failed to send"]);
}
?>
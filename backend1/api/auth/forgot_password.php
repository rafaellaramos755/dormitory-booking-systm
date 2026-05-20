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

require_once "../../config/db.php";

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Email is required"]);
    exit();
}

// Check if email exists
$stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    // For security, don't reveal that email doesn't exist
    echo json_encode(["success" => true, "message" => "If your email is registered, you will receive a reset link."]);
    exit();
}

// Generate reset token
$token = bin2hex(random_bytes(32));
$expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

$update = $pdo->prepare("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?");
$update->execute([$token, $expiry, $user['id']]);

// Send email (using PHP mail function)
$resetLink = "http://localhost:5173/reset-password?token=" . $token;
$subject = "Password Reset Request - DormiFind";
$message = "Hello " . $user['name'] . ",\n\n";
$message .= "You requested to reset your password. Click the link below to reset it:\n\n";
$message .= $resetLink . "\n\n";
$message .= "This link expires in 1 hour.\n\n";
$message .= "If you did not request this, please ignore this email.\n\n";
$message .= "Regards,\nDormiFind Team";

$headers = "From: no-reply@dormifind.com\r\n";
$headers .= "Reply-To: support@dormifind.com\r\n";

// For localhost, you may need to configure mail. Use a library like PHPMailer or use a fake mail catcher.
// For now, we'll log the link to a file for testing (since localhost may not send mail).
$logFile = __DIR__ . "/reset_links.log";
file_put_contents($logFile, date('Y-m-d H:i:s') . " - $email: $resetLink\n", FILE_APPEND);

// Attempt to send email (may fail on localhost, but we log it)
$mailSent = mail($email, $subject, $message, $headers);

echo json_encode(["success" => true, "message" => "If your email is registered, you will receive a reset link."]);
?>
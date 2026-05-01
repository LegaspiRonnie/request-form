<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Basic CORS (dev-friendly). Tighten origins for production.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([
    'status' => 'error',
    'message' => 'Method not allowed',
  ]);
  exit;
}

require_once __DIR__ . '/config/db.php';

function json_error(int $code, string $message): void {
  http_response_code($code);
  echo json_encode([
    'status' => 'error',
    'message' => $message,
  ]);
  exit;
}

// Accept JSON body OR form-data
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$raw = file_get_contents('php://input');
$data = null;

if (stripos($contentType, 'application/json') !== false) {
  $decoded = json_decode($raw, true);
  if (!is_array($decoded)) {
    json_error(400, 'Invalid JSON payload.');
  }
  $data = $decoded;
} else {
  // form-data / x-www-form-urlencoded
  $data = $_POST;
}

$full_name = trim((string)($data['full_name'] ?? ''));
$reason = trim((string)($data['reason'] ?? ''));
$description = trim((string)($data['description'] ?? ''));
$fb_url = trim((string)($data['fb_url'] ?? ''));

if ($full_name === '') json_error(422, 'Full name is required.');
if ($reason === '') json_error(422, 'Reason is required.');
if ($description === '') json_error(422, 'Reason description is required.');

if ($fb_url !== '') {
  // Accept URLs with or without protocol.
  $normalized = preg_match('/^https?:\/\//i', $fb_url) ? $fb_url : "https://{$fb_url}";
  if (!filter_var($normalized, FILTER_VALIDATE_URL)) {
    json_error(422, 'FB URL must be a valid URL.');
  }
  $fb_url = $normalized;
} else {
  $fb_url = null;
}

try {
  $pdo = get_pdo();

  $stmt = $pdo->prepare(
    'INSERT INTO requests (full_name, reason, description, fb_url) VALUES (:full_name, :reason, :description, :fb_url)'
  );

  $stmt->execute([
    ':full_name' => $full_name,
    ':reason' => $reason,
    ':description' => $description,
    ':fb_url' => $fb_url,
  ]);

  echo json_encode([
    'status' => 'success',
    'message' => 'Request submitted successfully',
  ]);
} catch (Throwable $e) {
  json_error(500, 'Server error. Please try again later.');
}


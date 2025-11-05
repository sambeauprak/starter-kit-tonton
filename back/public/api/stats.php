<?php
require_once __DIR__ . '/../../src/controllers/statsController.php';

switch ($action) {
    case 'index':
        statsIndex($pdo);
        break;
    case 'revenue':
        statsRevenue($pdo);
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Not Found']);
}

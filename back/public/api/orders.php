<?php
require_once __DIR__ . '/../../src/controllers/ordersController.php';

switch ($action) {
    case 'index':
        ordersIndex($pdo);
        break;
    case 'show':
        ordersShow($pdo, $_GET['id'] ?? null);
        break;
    case 'create':
        ordersCreate($pdo);
        break;
    case 'editStatus':
        ordersEditStatus($pdo, $_GET['id'] ?? null);
        break;
    case 'replaceItems':
        ordersReplaceItems($pdo, $_GET['id'] ?? null);
        break;
    case 'delete':
        ordersDelete($pdo, $_GET['id'] ?? null);
        break;
    case 'export':
        ordersExport($pdo);
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Not Found']);
}

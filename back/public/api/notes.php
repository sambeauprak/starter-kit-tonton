<?php
require_once __DIR__ . '/../../src/controllers/noteController.php';

switch ($action) {
    case 'index':
        notesIndex($pdo);
        break;
    case 'create':
        notesCreate($pdo);
        break;
    case 'edit':
        notesEdit($pdo, $_GET['id'] ?? null);
        break;
    case 'delete':
        notesDelete($pdo, $_GET['id'] ?? null);
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Not Found']);
}

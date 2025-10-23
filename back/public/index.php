<?php
require_once __DIR__ . '/../src/controllers/noteController.php';

$route = $_GET['route'] ?? 'notes.index';


switch ($route) {

    case 'notes.index':
        listNotes($pdo);
        break;
    case 'notes.create':
        createNote($pdo, $_POST['title'] ?? '', $_POST['content'] ?? '');
        break;
    case 'notes.edit':
        if (isset($_GET['id'])) {
            editNote($pdo, $_GET['id'], $_POST['title'] ?? '', $_POST['content'] ?? '');
        }
        break;
    case 'notes.delete':
        if (isset($_GET['id'])) {
            removeNote($pdo, $_GET['id']);
        }
        break;
    default:
        http_response_code(404);
        echo json_encode(["message" => "Not Found"]);
        break;
}
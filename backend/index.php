<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    class TodoManager {
        private $dataFile = 'todos.json';

        public function __construct() { 
            if (!file_exists($this->dataFile)) { 
                file_put_contents($this->dataFile,json_encode([]));
            }
        }

        private function readTodos() {
            $data = file_get_contents($this->dataFile);
            return json_decode($data, true) ?: [];
        }

        private function saveTodos($todos) {
            file_put_contents($this->dataFile, json_encode($todos, JSON_PRETTY_PRINT));
        }

        public function getAllTodos() {
            return $this->readTodos();
        }

        public function createTodo($data) {
            $todos = $this->readTodos();

            $newTodo = [
                'id' => uniqid(),
                'title' => $data['title'] ?? '',
                'completed' => false,
                'createdAt' => date('Y-m-d H:i:s')
            ];

            $todos[] = $newTodo;
            $this->saveTodos($todos);

            return $newTodo;
        }

        public function updateTodo($id, $data) {
            $todos = $this->readTodos();

            foreach ($todos as &$todo) {
                if ($todo['id'] === $id) {
                    if (isset($data['title'])) {
                        $todo['title'] = $data['title'];
                    }

                    if(isset($data['completed'])) {
                        $todo['completed'] = $data['completed'];
                    }

                    $this->saveTodos($todos);
                    return $todo;
                }
            }

            return null;
        }

        public function deleteTodo($id) {
            $todos = $this->readTodos();

            $filteredTodos = array_filter($todos, function($todo) use ($id) {
                return $todo['id'] !== $id;
            });

            $filteredTodos = array_values($filteredTodos);

            $this->saveTodos($filteredTodos);

            return count($todos) !== count($filteredTodos);
        }
    }

    $todoManager = new TodoManager();

    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['PATH_INFO'] ?? '/';

    $pathParts = explode('/', trim($path, '/'));
    $todoId = $pathParts[1] ?? null;

    try {
        switch ($method) {
            case 'GET':
                $todos = $todoManager->getAllTodos();
                echo json_encode(['success' => true, 'data' => $todos]);
                break;
            case 'POST':
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (empty($input['title'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Título é obrigatório']);
                    break;
                }

                $newTodo = $todoManager->createTodo($input);
                http_response_code(201);
                echo json_encode(['success' => true, 'data' => $newTodo]);

                break;
            case 'PUT':
                // Atualiza uma tarefa existente
                if (!$todoId) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
                    break;
                }
                
                $input = json_decode(file_get_contents('php://input'), true);
                $updatedTodo = $todoManager->updateTodo($todoId, $input);
                
                if ($updatedTodo) {
                    echo json_encode(['success' => true, 'data' => $updatedTodo]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Tarefa não encontrada']);
                }
                break;
            case 'DELETE':
                // Remove uma tarefa
                if (!$todoId) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
                    break;
                }
                
                $deleted = $todoManager->deleteTodo($todoId);
                
                if ($deleted) {
                    echo json_encode(['success' => true, 'message' => 'Tarefa removida']);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Tarefa não encontrada']);
                }
                break;
                
            default:
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Método não permitido']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
    }
?>
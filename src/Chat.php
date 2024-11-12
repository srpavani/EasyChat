<?php
namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface {
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg);
        if (!$data) return; // Ignora JSON inválido
    
        switch ($data->type) {
            case 'text':
                $this->broadcastMessage($from, [
                    'type' => 'text',
                    'username' => $data->username ?? 'Anônimo',
                    'msg' => $data->msg
                ]);
                break;
                
            case 'code':
                // Tratamento específico para envio de código
                $this->broadcastMessage($from, [
                    'type' => 'code',
                    'username' => $data->username ?? 'Anônimo',
                    'msg' => $data->msg // Envia o código como texto sem modificações
                ]);
                break;
            
            case 'image':
                // Tratamento específico para envio de imagens
                $this->broadcastMessage($from, [
                    'type' => 'image',
                    'username' => $data->username ?? 'Anônimo',
                    'content' => $data->content // Envia a imagem como base64
                ]);
                break;
        }
    }
    
    private function broadcastMessage($from, $data) {
        foreach ($this->clients as $client) {
            if ($from !== $client) {
                $client->send(json_encode($data));
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
}

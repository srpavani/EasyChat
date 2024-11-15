<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat com WebSocket</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
    <h2>Chat Online</h2>
    <input type="text" id="username" class="form-control mb-2" placeholder="Digite seu nome...">
    <div id="messageArea" class="border bg-light p-3" style="height: 300px; overflow-y: auto;"></div>
    <textarea id="messageInput" class="form-control my-3" placeholder="Digite sua mensagem aqui..."></textarea>
    <input type="file" id="fileInput" class="form-control mb-2" style="display: none;">
    <button id="sendButton" class="btn btn-primary">Enviar Mensagem</button>
    <button id="sendFileButton" class="btn btn-secondary" style="display: none;">Enviar Arquivo</button>
</div>


<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="app.js"></script>
</body>
</html>

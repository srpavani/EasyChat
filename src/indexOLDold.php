<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat com WebSocket</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism.min.css" rel="stylesheet"> <!-- Prism CSS -->
    <link href="style.css" rel="stylesheet">
</head>
<body>
<div class="container mt-5">
    <h2>Chat Online</h2>
    <input type="text" id="username" class="form-control mb-2" placeholder="Digite seu nome...">
    
    <!-- Área de mensagens e pré-visualização -->
    <div id="messageArea" class="border bg-light p-3" style="height: 300px; overflow-y: auto;"></div>
    <img id="previewImage" style="display: none; max-width: 100px; height: auto; margin-top: 10px; cursor: pointer;" alt="Pré-visualização da Imagem">
    
    <textarea id="messageInput" class="form-control my-3" placeholder="Digite sua mensagem ou cole seu código aqui..."></textarea>
    
    <button id="sendButton" class="btn btn-primary">Enviar Mensagem</button>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js"></script> <!-- Prism JS -->
<script src="app.js"></script>
</body>
</html>

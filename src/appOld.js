$(document).ready(function() {
    var conn = new WebSocket('ws://localhost:8080');
    var username = '';

    // Evento para atualizar o nome do usuário
    $('#username').on('change', function() {
        username = $(this).val();
    });

    // Tratamento do evento de colar para capturar e enviar imagens
    $(document).on('paste', function(e) {
        var items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (var index in items) {
            var item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image')) { // Garantindo que é uma imagem
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function(event) {
                    // Enviando a imagem como base64 através do WebSocket
                    conn.send(JSON.stringify({
                        type: 'image', 
                        username: username, 
                        filename: blob.name, 
                        content: event.target.result
                    }));
                };
                reader.readAsDataURL(blob);
            }
        }
    });

    // Configuração de eventos do WebSocket
    conn.onopen = function() {
        console.log("Conexão estabelecida!");
    };

    conn.onerror = function(error) {
        console.log('Erro de conexão', error);
    };

    conn.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var sender = data.username ? data.username : 'Anônimo';
        if (data.type === 'text') {
            $('#messageArea').append('<div><strong>' + sender + ':</strong> ' + data.msg + '</div>');
        } else if (data.type === 'image') {
            $('#messageArea').append('<div><strong>' + sender + ':</strong> enviou uma imagem.</div>');
            $('#messageArea').append('<img src="' + data.content + '" style="max-width: 100%; height: auto;">');
        }
    };


    // Evento para enviar mensagens de texto
    $('#sendButton').click(function() {
        if (conn.readyState === WebSocket.OPEN) {
            var message = $('#messageInput').val();
            if (message) {
                // Adiciona a mensagem ao HTML imediatamente
                $('#messageArea').append('<div><strong>' + (username || 'Eu') + ':</strong> ' + message + '</div>');

                // Envia a mensagem para o servidor
                conn.send(JSON.stringify({
                    type: 'text', 
                    username: username, 
                    msg: message
                }));

                // Limpa o campo de entrada após enviar
                $('#messageInput').val('');
            }
        } else {
            console.log('Conexão não está aberta.');
        }
    });
});
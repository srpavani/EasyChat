$(document).ready(function() {
    var conn;
    if (!conn) { // Garante que a conexão só seja estabelecida uma vez
        conn = new WebSocket('ws://localhost:8080');
    }
    
    var username = '';

    $('#username').on('change', function() {
        username = $(this).val();
    });

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
        } else if (data.type === 'code') {
            $('#messageArea').append(`
                <div><strong>${sender}:</strong> enviou um código:</div>
                <pre><code class="language-plaintext">${data.msg}</code></pre>
            `);
            Prism.highlightAll();
        } else if (data.type === 'image') {
            // Exibe a imagem com uma opção para ampliação em um modal
            $('#messageArea').append(`
                <div><strong>${sender}:</strong> enviou uma imagem.</div>
                <img src="${data.content}" class="chat-image" style="max-width: 100px; height: auto; cursor: pointer;" />
            `);
        }
    };

    function sendMessage() {
        if (conn.readyState === WebSocket.OPEN) {
            var message = $('#messageInput').val();
            if (message) {
                var messageType = message.includes(';') || message.includes('    ') ? 'code' : 'text';

                if (messageType === 'code') {
                    $('#messageArea').append(`
                        <div><strong>${username || 'Eu'}:</strong> enviou um código:</div>
                        <pre><code class="language-plaintext">${message}</code></pre>
                    `);
                    Prism.highlightAll();

                    conn.send(JSON.stringify({
                        type: messageType, 
                        username: username, 
                        msg: message
                    }));
                } else {
                    $('#messageArea').append('<div><strong>' + (username || 'Eu') + ':</strong> ' + message + '</div>');
                    
                    conn.send(JSON.stringify({
                        type: messageType, 
                        username: username, 
                        msg: message
                    }));
                }

                $('#messageInput').val('');
            }
        } else {
            console.log('Conexão não está aberta.');
        }
    }

    $('#sendButton').click(function() {
        sendMessage();
    });

    $('#messageInput').keypress(function(e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Tratamento do evento de colagem para capturar e enviar imagens
    $(document).on('paste', function(e) {
        var items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (var index in items) {
            var item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image')) { // Garantindo que é uma imagem
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function(event) {
                    // Exibe a imagem localmente
                    $('#messageArea').append(`
                        <div><strong>${username || 'Eu'}:</strong> enviou uma imagem.</div>
                        <img src="${event.target.result}" class="chat-image" style="max-width: 100px; height: auto; cursor: pointer;" />
                    `);

                    // Enviando a imagem como base64 através do WebSocket
                    conn.send(JSON.stringify({
                        type: 'image', 
                        username: username, 
                        content: event.target.result // Imagem em base64
                    }));
                };
                reader.readAsDataURL(blob);
            }
        }
    });

    // Função para exibir a imagem em um modal ao clicar
    $(document).on('click', '.chat-image', function() {
        var src = $(this).attr('src');
        $('#imageModal img').attr('src', src);
        $('#imageModal').show();
    });

    // Função para fechar o modal ao clicar fora da imagem
    $('#imageModal').click(function() {
        $(this).hide();
    });
});

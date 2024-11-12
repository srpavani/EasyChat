$(document).ready(function() {
    var conn = new WebSocket('ws://localhost:8080');
    var username = '';

    // Evento para atualizar o nome do usuário
    $('#username').on('change', function() {
        username = $(this).val();
    });

    // Tratamento do evento de colar para capturar, pré-visualizar e enviar imagens
    $(document).on('paste', function(e) {
        var items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (var index in items) {
            var item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image')) { // Garantindo que é uma imagem
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function(event) {
                    // Pré-visualizar a imagem no campo de texto
                    $('#previewImage').attr('src', event.target.result).show();
                    
                    // Clique para remover a pré-visualização, se desejado
                    $('#previewImage').off('click').on('click', function() {
                        $(this).hide();
                    });

                    // Enviar imagem com a pré-visualização confirmada
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
            // Adicionar a imagem recebida com um link para visualização ampliada
            $('#messageArea').append('<div><strong>' + sender + ':</strong> enviou uma imagem.</div>');
            $('#messageArea').append(`
                <a href="${data.content}" target="_blank" class="image-link">
                    <img src="${data.content}" style="max-width: 100px; height: auto; cursor: pointer;" />
                </a>
            `);
        }
    };

    // Função para enviar a mensagem
    function sendMessage() {
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
    }

    // Evento para enviar mensagens de texto ao clicar no botão "Enviar"
    $('#sendButton').click(function() {
        sendMessage();
    });

    // Evento para enviar mensagens ao pressionar Enter
    $('#messageInput').keypress(function(e) {
        if (e.which === 13 && !e.shiftKey) { // Verifica se a tecla Enter foi pressionada sem Shift
            e.preventDefault(); // Impede a quebra de linha
            sendMessage();
        }
    });
});

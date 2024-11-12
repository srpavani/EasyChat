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
            // Escapa o código antes de exibir para evitar interpretação de HTML
            const escapedCode = escapeHtml(data.msg);
            $('#messageArea').append(`
                <div><strong>${sender}:</strong> enviou um código:</div>
                <div style="position: relative;">
                    <button class="copy-btn" style="position: absolute; right: 0; top: 0;">Copiar Código</button>
                    <pre><code class="language-plaintext">${escapedCode}</code></pre>
                </div>
            `);
            Prism.highlightAll();
        } else if (data.type === 'image') {
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
                    const escapedMessage = escapeHtml(message);
                    $('#messageArea').append(`
                        <div><strong>${username || 'Eu'}:</strong> enviou um código:</div>
                        <div style="position: relative;">
                            <button class="copy-btn" style="position: absolute; right: 0; top: 0;">Copiar Código</button>
                            <pre><code class="language-plaintext">${escapedMessage}</code></pre>
                        </div>
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
                    $('#messageArea').append(`
                        <div><strong>${username || 'Eu'}:</strong> enviou uma imagem.</div>
                        <img src="${event.target.result}" class="chat-image" style="max-width: 100px; height: auto; cursor: pointer;" />
                    `);

                    conn.send(JSON.stringify({
                        type: 'image', 
                        username: username, 
                        content: event.target.result
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

    // Função para escapar o HTML
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Função para copiar o conteúdo do código ao clicar no botão "Copiar Código"
    $(document).on('click', '.copy-btn', function() {
        var codeContent = $(this).siblings('pre').text();
        navigator.clipboard.writeText(codeContent).then(() => {
            alert("Código copiado para a área de transferência!");
        }).catch(err => {
            console.error("Erro ao copiar o código: ", err);
        });
    });
});

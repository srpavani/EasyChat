$(document).ready(function() {
    var conn = new WebSocket('ws://localhost:8080');
    var username = '';

    $('#username').on('change', function() {
        username = $(this).val();
    });

    $(document).on('paste', function(e) {
        var items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (var index in items) {
            var item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image')) {
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function(event) {
                    $('#previewImage').attr('src', event.target.result).show();
                    $('#previewImage').off('click').on('click', function() {
                        $(this).hide();
                    });

                    conn.send(JSON.stringify({
                        type: 'image', 
                        username: username, 
                        filename: blob.name, 
                        content: event.target.result
                    }));

                    $('#previewImage').hide();
                };
                reader.readAsDataURL(blob);
            }
        }
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
                <pre><code class="language-none">${data.msg}</code></pre>
            `);
            Prism.highlightAll(); // Atualiza a marcação de todos os blocos de código no DOM
        } else if (data.type === 'image') {
            $('#messageArea').append('<div><strong>' + sender + ':</strong> enviou uma imagem.</div>');
            $('#messageArea').append(`
                <a href="${data.content}" target="_blank" class="image-link">
                    <img src="${data.content}" style="max-width: 100px; height: auto; cursor: pointer;" />
                </a>
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
                        <pre><code class="language-none">${message}</code></pre>
                    `);
                    Prism.highlightAll();

                    console.log("Enviando código:", message);

                    conn.send(JSON.stringify({
                        type: messageType, 
                        username: username, 
                        msg: message
                    }));
                } else {
                    $('#messageArea').append('<div><strong>' + (username || 'Eu') + ':</strong> ' + message + '</div>');
                    
                    console.log("Enviando mensagem de texto:", message);

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
});

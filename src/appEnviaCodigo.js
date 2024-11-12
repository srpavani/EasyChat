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

                    console.log("Enviando código:", message);

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
});

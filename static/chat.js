function chatBot() {
    return {
        botTyping: false,
        messages: [{
            from: 'bot',
            text: 'Wie kann ich Ihnen behilflich sein?'
        }],
        output: function(input) {
            let product = 'Cool!';

            // Update DOM
            this.addChat(input, product);
        },
        addChat: function(input, product) {

            // Add user message
            this.messages.push({
                from: 'user',
                text: input
            });

            // Keep messages at most recent
            this.scrollChat();

            // Fake delay to seem "real"
            setTimeout(() => {
                this.botTyping = true;
                this.scrollChat();
            }, 1000)

            // add bit message with Fake delay to seem "real"
            setTimeout(() => {
                this.botTyping = false;
                this.messages.push({
                    from: 'bot',
                    text: product
                });
                this.scrollChat();
            }, ((product.length / 10) * 1000) + (Math.floor(Math.random() * 2000) + 1500))

        },
        scrollChat: function() {
            const messagesContainer = document.getElementById("messages");
            messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            }, 100);
        },
        updateChat: function(target) {
            if (target.value.trim()) {
                this.output(target.value.trim());
                target.value = '';
            }
        }
    }
}
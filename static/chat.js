function chatBot() {
    return {
        botTyping: false,
        messages: [{
            from: 'bot',
            text: 'How may I be of service?'
        }],
        mediaRecorder: null,
        audioChunks: [],
        isRecording: false,
        init: function() {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    this.mediaRecorder = new MediaRecorder(stream);
                    
                    this.mediaRecorder.ondataavailable = (e) => {
                        this.audioChunks.push(e.data);
                    }

                    this.mediaRecorder.onstart = () => {
                        this.audioChunks = [];
                        this.isRecording = true;
                        document.getElementById('micIcon').classList.remove("fa-microphone");
                        document.getElementById('micIcon').classList.add("fa-microphone-slash");
                        document.getElementById('recordButton').classList.add('recording');
                        console.log('Recording started');
                    }

                    this.mediaRecorder.onstop = () => {
                        this.isRecording = false;
                        document.getElementById('micIcon').classList.remove("fa-microphone-slash");
                        document.getElementById('micIcon').classList.add("fa-microphone");
                        document.getElementById('recordButton').classList.remove('recording');
                        console.log('Recording ended');

                        const audioBlob = new Blob(this.audioChunks, { type: 'audio/chunks[0].type' });
                        // alert(audioBlob.size)

                        const formData = new FormData();
                        formData.append('audio', audioBlob);
                        // alert(formData.get('audio'))

                        let self = this;
                        $.ajax({
                            type: 'POST',
                            url: '/',
                            processData: false,
                            contentType: false,
                            data: formData,
                            success: function(response) {
                                console.log(response["transcription"]);
                                self.output(response["transcription"]);
                            },
                            error: function(error) {
                                console.error(error);
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Error accessing microphone:', error);
                });
        },
        clearChat: function() {
            this.messages= [{
                from: 'bot',
                text: 'How may I be of service?'
            }]
        },
        switchMode: function() {
            if (this.mode === 'classification') {
                this.mode = 'generation';
            } else {
                this.mode = 'classification';
            }
        },
        output: function(input) {
            this.messages.push({
                from: 'user',
                text: input
            });

            this.scrollChat();
            this.botTyping = true;
            this.scrollChat();

            let self = this;
            if (!document.getElementById('mode').checked) {
                $.ajax({
                    type: 'POST',
                    url: '/query/name',
                    data: { text: input },
                    success: function(response) {
                        let message = {
                            from: 'bot',
                            text: '',
                            more: null
                        };
                    
                        if (response["output"] === '') {
                            message.text = 'Sorry, I am not able to provide a module the fulfills your request. Please try again.';
                        }
                        else {
                            message.text = 'The module that best fulfills your request is: ' + response["output"] + '.';
                            message.more = response["output"];
                        }
                    
                        self.botTyping = false;
                        self.messages.push(message);
                        self.scrollChat();
                    },
                    error: function(error) {
                        console.error(error);
                        self.botTyping = false;
                        self.messages.push({
                            from: 'bot',
                            text: 'Sorry, an error occured. Please try again.'
                        });
                        self.scrollChat();
                    }
                });
            } else {
                $.ajax({
                    type: 'POST',
                    url: '/query/describe',
                    data: { text: input },
                    success: function(response) {
                        product = response["output"];
                        self.botTyping = false;
                        self.messages.push({
                            from: 'bot',
                            text: product
                        });
                        self.scrollChat();
                    },
                    error: function(error) {
                        console.error(error);
                        self.botTyping = false;
                        self.messages.push({
                            from: 'bot',
                            text: 'Sorry, an error occured. Please try again.'
                        });
                        self.scrollChat();
                    }
                });
            }
        },
        more: function(module) {
            let input = 'Tell me about ' + module + '.';
            this.messages.push({
                from: 'user',
                text: input
            });

            this.scrollChat();
            this.botTyping = true;
            this.scrollChat();

            let self = this;
            $.ajax({
                type: 'POST',
                url: '/query/describe',
                data: { text: input },
                success: function(response) {
                    product = response["output"];
                    self.botTyping = false;
                    self.messages.push({
                        from: 'bot',
                        text: product
                    });
                    self.scrollChat();
                },
                error: function(error) {
                    console.error(error);
                    self.botTyping = false;
                    self.messages.push({
                        from: 'bot',
                        text: 'Sorry, an error occured. Please try again.'
                    });
                    self.scrollChat();
                }
            });
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
        },
        record: function() {
            if (!this.isRecording) {
                this.mediaRecorder.start();
            } else {
                this.mediaRecorder.stop();
            }
        },
    }
}
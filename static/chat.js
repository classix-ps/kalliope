function chatBot() {
    return {
        botTyping: false,
        messages: [{
            from: 'bot',
            text: 'Wie kann ich Ihnen behilflich sein?'
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
                    
                        // Create a new Blob containing the recorded audio
                        const audioBlob = new Blob(this.audioChunks, { type: 'audio/chunks[0].type' });
                        // alert(audioBlob.size)
                    
                        // Create FormData object to send audio file to server
                        const formData = new FormData();
                        formData.append('audio', audioBlob);
                        // alert(formData.get('audio'))
                    
                        // Send POST request to server
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
        output: function(input) {
            // Add user message
            this.messages.push({
                from: 'user',
                text: input
            });

            // Keep messages at most recent
            this.scrollChat();


            this.botTyping = true;
            this.scrollChat();

            let product = 'Cool!';
            let self = this;
            $.ajax({
                type: 'POST',
                url: '/query/name',
                data: { text: input },
                success: function(response) {
                    product = response["output"];
                    if (product === '') {
                        product = 'Sorry, I did not understand your request. Please try again.';
                    }
                    self.botTyping = false;
                    self.messages.push({
                        from: 'bot',
                        text: product
                    });
                    self.scrollChat();
                },
                error: function(error) {
                    console.error(error);
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
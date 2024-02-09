let mediaRecorder;
let stream;
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(mediaStream => {
        stream = mediaStream;
    })
    .catch(error => {
        console.error('Error accessing microphone:', error);
    });

function chatBot() {
    return {
        botTyping: false,
        messages: [{
            from: 'bot',
            text: 'Wie kann ich Ihnen behilflich sein?'
        }],
        audioChunks: [],
        isRecording: false,
        output: function(input) {
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
            }, 500)

            let product = 'Cool!';

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
        },
        record: function() {
            if (!this.isRecording) {
                this.startRecording();
            } else {
                this.stopRecording();
            }
        },
        startRecording: function() {
            // audioChunks = []; // Clear previous audio chunks
            // mediaRecorder = new MediaRecorder(stream);
        
            // mediaRecorder.addEventListener('dataavailable', event => {
            //     audioChunks.push(event.data);
            // });
        
            // mediaRecorder.start();
            this.isRecording = true;
            document.getElementById('micIcon').classList.remove("fa-microphone");
            document.getElementById('micIcon').classList.add("fa-microphone-slash");
            document.getElementById('recordButton').classList.add('recording');
            console.log('Recording started');
        },
        stopRecording: function() {
            // mediaRecorder.stop();
            this.isRecording = false;
            document.getElementById('micIcon').classList.remove("fa-microphone-slash");
            document.getElementById('micIcon').classList.add("fa-microphone");
            document.getElementById('recordButton').classList.remove('recording');
            console.log('Recording ended');
        
            // Create a new Blob containing the recorded audio
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/chunks[0].type' });
        
            // Create FormData object to send audio file to server
            const formData = new FormData();
            formData.append('audio', audioBlob);

            let self = this;

            // Send POST request to server
            $.ajax({
                type: 'POST',
                url: '/',
                contentType: 'application/json',
                data: JSON.stringify({"text": "test"}),
                success: function(response) {
                    console.log(response["response"]);
                    self.output(response["response"]);
                    this.audioChunks = [];
                },
                error: function(error) {
                    console.error(error);
                }
            });
        
            // $.ajax({
            //     type: 'POST',
            //     url: '/',
            //     processData: false,
            //     contentType: false,
            //     data: formData,
            //     success: function(response) {},
            //     error: function(error) {
            //         console.error(error);
            //     }
            // });
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const chatBotInstance = new ChatBot();
});
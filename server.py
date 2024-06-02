from flask import Flask, request
from flask_socketio import SocketIO
from transformers import AutoTokenizer, AutoModelWithLMHead
import torch

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # Allow all origins

tokenizer = AutoTokenizer.from_pretrained("amphion/text_to_audio")
model = AutoModelWithLMHead.from_pretrained("amphion/text_to_audio")

@socketio.on('message')
def handle_message(message):
    print('received message: ' + message)
    text = message
    inputs = tokenizer(text, return_tensors='pt')
    audio_logits = model(**inputs).logits
    audio = torch.argmax(audio_logits, dim=-1)
    socketio.emit('result', audio)

if __name__ == '__main__':
    socketio.run(app, port=5000)
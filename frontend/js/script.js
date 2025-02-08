const socket = new WebSocket('ws://localhost:8080'); 
const loginForm = document.querySelector('.login__form');
const chatSection = document.querySelector('.chat');
const loginSection = document.querySelector('.login');
const chatInput = document.querySelector('.chat__input');
const chatForm = document.querySelector('.chat__form');
const chatMessages = document.querySelector('.chat__messages');
const notificationSound = document.getElementById('notification-sound');
const emojiButton = document.querySelector('.emoji-button');
const emojiPicker = document.querySelector('.emoji-picker');
const emojiList = document.querySelector('.emoji-list');
const alertBox = document.querySelector('.alert-box');

let userName = '';
let typingTimeout;

// Tocar som de notificação
function playNotificationSound() {
    notificationSound.play().catch(error => console.error("Erro ao tocar o som:", error));
}

// Exibir alerta estilizado
function showAlert(message) {
    alertBox.textContent = message;
    alertBox.style.display = "block";
    setTimeout(() => {
        alertBox.style.display = "none";
    }, 3000);
}

// Exibir indicador de digitação
function showTypingIndicator(user) {
    let typingIndicator = document.querySelector('.typing-indicator');
    if (!typingIndicator) {
        typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        document.body.appendChild(typingIndicator);
    }
    typingIndicator.innerHTML = `${user} <span class="dots"><span>.</span><span>.</span><span>.</span></span>`;
    typingIndicator.style.display = 'block';
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => hideTypingIndicator(), 3000);
}

// Esconder indicador de digitação
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

socket.onmessage = (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch (error) {
        console.error("Erro ao analisar a mensagem do WebSocket:", error);
        return;
    }

    if (data.type === 'chat-message') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', data.sender === userName ? 'message--self' : 'message--other');
        messageElement.innerHTML = `<span class="sender-name">${data.sender}:</span> ${data.message}`;
        chatMessages.appendChild(messageElement);
        playNotificationSound();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    if (data.type === 'user-connected') {
        showAlert(`${data.userName} entrou no chat.`);
    }

    if (data.type === 'typing') {
        showTypingIndicator(data.userName);
    }
};

// Login do usuário
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('.login__input');
    if (!input.value.trim()) {
        alert("Por favor, insira um nome de usuário!");
        return;
    }
    userName = input.value.trim();
    socket.send(JSON.stringify({ type: 'user-connected', userName }));
    loginSection.style.display = 'none';
    chatSection.style.display = 'flex';
});

// Exibir ou ocultar o seletor de emojis
emojiButton.addEventListener('click', (event) => {
    event.preventDefault();
    emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
});

// Inserir emoji ao clicar
emojiList.addEventListener('click', (event) => {
    if (event.target.tagName === 'SPAN') {
        chatInput.value += event.target.textContent;
        chatInput.focus();
        emojiPicker.style.display = 'none';
    }
});

// Enviar mensagem
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message !== "") {
        socket.send(JSON.stringify({ type: 'chat-message', sender: userName, message }));
        chatInput.value = "";
    }
});

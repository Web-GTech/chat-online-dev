// Seleção de elementos
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const typingIndicator = chat.querySelector(".typing-indicator");
const emojiButton = chat.querySelector(".emoji-button");
const emojiPopup = chat.querySelector(".emoji-popup");
const closeEmojiPopupButton = chat.querySelector(".close-emoji-popup");
const emojiElements = chat.querySelectorAll(".emoji");

const messageSound = new Audio("/frontend/sounds/message.mp3");
const sendMessageSound = new Audio("../frontend/sounds/message.mp3");
const joinSound = new Audio("/sounds/join.mp3");

let websocket;
let user = { id: "", name: "", color: "" };
let typingTimeout;

const createMessageElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    div.classList.add(sender === user.name ? "message--self" : "message--other");
    div.innerHTML = `<span style="color:${senderColor};">${sender}</span>: ${content}`;
    return div;
};

const showAlert = (message) => {
    const alertBox = document.createElement("div");
    alertBox.textContent = message;
    alertBox.style.position = "absolute";
    alertBox.style.top = "10px";
    alertBox.style.left = "50%";
    alertBox.style.transform = "translateX(-50%)";
    alertBox.style.padding = "10px";
    alertBox.style.backgroundColor = "#4CAF50";
    alertBox.style.color = "white";
    alertBox.style.borderRadius = "5px";
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 3000);
};

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content, type } = JSON.parse(data);

    if (type === "typing") {
        typingIndicator.textContent = `${userName} digitando...`;
        typingIndicator.style.display = "block";
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => typingIndicator.style.display = "none", 1500);
        return;
    }

    if (type === "join") {
        showAlert(`${userName} entrou`);
        joinSound.play().catch(console.log);
        return;
    }

    const message = createMessageElement(content, userName, userColor);
    chatMessages.appendChild(message);
    messageSound.play().catch(console.log);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const handleLogin = (event) => {
    event.preventDefault()

    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.color = getRandomColor()

    login.style.display = "none"
    chat.style.display = "flex"

    websocket = new WebSocket("wss://chat-dev-e927.onrender.com")
    websocket.onmessage = processMessage
};

const sendMessage = (event) => {
    event.preventDefault();
    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };
    websocket.send(JSON.stringify(message));
    sendMessageSound.play().catch(console.log);
    chatInput.value = "";
};

const notifyTyping = () => {
    websocket.send(JSON.stringify({ type: "typing", userName: user.name }));
};

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
chatInput.addEventListener("input", notifyTyping);

// Emoji Popup
emojiButton.addEventListener("click", () => {
    emojiPopup.style.display = emojiPopup.style.display === "none" ? "block" : "none";
});

closeEmojiPopupButton.addEventListener("click", () => {
    emojiPopup.style.display = "none";
});

emojiElements.forEach((emoji) => {
    emoji.addEventListener("click", () => {
        chatInput.value += emoji.textContent;
        chatInput.focus();
    });
});

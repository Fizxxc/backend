require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.use(express.json());
app.use(express.static("public"));

app.post("/send-wa", (req, res) => {
    console.log("Request diterima:", req.body);
    
    if (!req.body.number || !req.body.message) {
        return res.json({ success: false, error: "Nomor atau pesan tidak boleh kosong" });
    }

    // Kirim notifikasi ke bot Telegram admin
    const telegramMessage = `📩 *Pesan WhatsApp Terkirim*\n👤 *Pengirim:* ${req.body.name}\n📞 *Nomor:* ${req.body.number}\n💬 *Pesan:* ${req.body.message}`;
    
    axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: "Markdown"
    }).then(() => {
        console.log("Pesan dikirim ke Telegram admin.");
    }).catch(err => console.error("Gagal mengirim ke Telegram:", err));

    res.json({ success: true });
});

io.on("connection", (socket) => {
    console.log("User connected");
    
    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

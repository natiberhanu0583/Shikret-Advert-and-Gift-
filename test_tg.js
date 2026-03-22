import 'dotenv/config';

async function testTelegram() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = '386301131'; // User's ID from telegram_map.json
    const msg = "✅ Test Successful! Your server is able to send messages to your account.";

    console.log(`🚀 Sending test message to ${chatId} using your token...`);
    
    try {
        const botUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await fetch(botUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: msg
            })
        });
        const data = await response.json();
        if (data.ok) {
            console.log("✅ SUCCESS! Message received by Telegram.");
        } else {
            console.error("❌ ERROR from Telegram:", data.description);
        }
    } catch (e) {
        console.error("❌ Connection error:", e.message);
    }
}

testTelegram();

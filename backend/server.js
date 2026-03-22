import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

// Serving the frontend's build folder (dist) ensures full integration
const frontendDist = path.join(__dirname, '../dist');
app.use(express.static(frontendDist));

// Serve uploaded files statically
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '';
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    res.json({ url: `${API_URL}/uploads/${req.file.filename}` });
});

app.post('/api/upload-audio', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio uploaded.' });
    }
    res.json({ url: `${API_URL}/uploads/${req.file.filename}` });
});

// JSON File Database setup
const DB_FILE = path.join(__dirname, 'database.json');
const TG_MAP_FILE = path.join(__dirname, 'telegram_map.json');

// Default initial state
const defaultDB = {
    orders: [],
    posts: [],
    settings: {
        phone: '+1 (555) 123-4567',
        email: 'orders@shikret.com',
        address: 'Main Office Street, 123, Business City'
    }
};

// Helper: Ensure the JSON database file exists
async function initializeDB() {
    try {
        await fs.access(DB_FILE);
    } catch {
        // If file doesn't exist, create it with default data
        await fs.writeFile(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf8');
        console.log('✅ Created new JSON database at:', DB_FILE);
    }
    try {
        await fs.access(TG_MAP_FILE);
    } catch {
        await fs.writeFile(TG_MAP_FILE, JSON.stringify({}, null, 2), 'utf8');
        console.log('✅ Created new Telegram user map at:', TG_MAP_FILE);
    }
}

// Helper: Read the entire database
async function readDB() {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper: Write to the database
async function writeDB(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Helper: Send Telegram status notification to customer
async function sendNotification(order, status) {
    console.log(`\n📣 sendNotification() - Order #${order.id}, Status: ${status.toUpperCase()}`);

    const firstName = order.first_name || 'Customer';
    const lastName = order.last_name || '';
    const orderTitle = order.service || 'your order';

    // === Build the message per status ===
    let msg = '';
    if (status === 'paid') {
        msg = [
            `✅ Payment Received — Shikret Advert`,
            ``,
            `Hello ${firstName}! We have confirmed your payment.`,
            `📦 Project: ${orderTitle}`,
            `⏳ Status: Your order is now being reviewed.`,
            ``,
            `We will notify you when preparation begins.`,
            `Thank you for choosing Shikret!`
        ].join('\n');
    } else if (status === 'preparing') {
        msg = [
            `🛠️ Order Preparing — Shikret Advert`,
            ``,
            `Hello ${firstName}! Great news!`,
            `📦 Project: ${orderTitle}`,
            `⚙️ Status: Our team has started working on your project.`,
            ``,
            `We will notify you when it's completed.`,
            `Shikret Advert & Gift`
        ].join('\n');
    } else if (status === 'completed') {
        msg = [
            `🎨 Order Completed — Shikret Advert`,
            ``,
            `Hello ${firstName}! Your project is DONE!`,
            `📦 Project: ${orderTitle}`,
            `✨ Status: Completed and ready for delivery/pickup.`,
            ``,
            `We will contact you shortly to arrange delivery.`,
            `Shikret Advert & Gift`
        ].join('\n');
    } else if (status === 'delivered') {
        msg = [
            `🎉 Order Delivered — Shikret Advert`,
            ``,
            `Congratulations ${firstName} ${lastName}!`,
            `📦 Project: ${orderTitle}`,
            `🚀 Status: DELIVERED successfully!`,
            ``,
            `Thank you so much for choosing Shikret Advert & Gift.`,
            `We look forward to serving you again! ⭐`
        ].join('\n');
    } else {
        msg = `Hello ${firstName}, your order [${orderTitle}] status has been updated to: ${status.toUpperCase()}. - Shikret Advert`;
    }

    console.log(`📝 Message:\n${msg}`);

    // === Find Telegram chat_id ===
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.warn('⚠️ TELEGRAM_BOT_TOKEN not set — skipping Telegram notification.');
        return;
    }

    const contactValue = order.contactValue || order.phone || '';
    const normalizedPhone = contactValue.replace(/\D/g, '');
    let finalChatId = null;

    try {
        const mapRaw = await fs.readFile(TG_MAP_FILE, 'utf8');
        const mapData = JSON.parse(mapRaw);

        // Priority 1: linked by order ID (most reliable — set when user /start-ed the bot with their order code)
        if (mapData[`order_${order.id}`]) {
            finalChatId = mapData[`order_${order.id}`];
            console.log(`✅ Chat ID found via Order ID link: ${finalChatId}`);
        }
        // Priority 2: linked by Telegram username
        else if (contactValue && contactValue.startsWith('@') && mapData[contactValue.toLowerCase()]) {
            finalChatId = mapData[contactValue.toLowerCase()];
            console.log(`✅ Chat ID found via username ${contactValue}: ${finalChatId}`);
        }
        // Priority 3: linked by phone number
        else if (normalizedPhone && mapData[normalizedPhone]) {
            finalChatId = mapData[normalizedPhone];
            console.log(`✅ Chat ID found via phone ${normalizedPhone}: ${finalChatId}`);
        }
        else {
            console.warn(`⚠️ No Telegram chat_id mapping found for order #${order.id} (contact: ${contactValue})`);
        }
    } catch (e) {
        console.error('❌ Error reading telegram_map.json:', e.message);
    }

    if (!finalChatId || !/^\d+$/.test(finalChatId.toString())) {
        console.warn(`⚠️ Invalid or missing chat_id (${finalChatId}) — cannot send Telegram message.`);
        return;
    }

    // === Send Telegram message ===
    try {
        console.log(`🚀 Sending Telegram message to chat_id: ${finalChatId}`);
        const botUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(botUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: finalChatId.toString(), text: msg })
        });
        const resData = await response.json();
        if (resData.ok) {
            console.log(`✅ Telegram notification sent successfully to ${finalChatId}`);
        } else {
            console.error(`❌ Telegram API error: ${resData.description}`);
        }
    } catch (botErr) {
        console.error('❌ Telegram fetch failed:', botErr.message);
    }
}

// ========================
// ORDERS API
// ========================
app.get('/api/orders', async (req, res) => {
    try {
        const db = await readDB();
        // Return orders newest first
        res.json([...db.orders].reverse());
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/orders', async (req, res) => {
    const { firstName, lastName, email, service, details, phone, itemTitle, audioUrl, screenshotUrl, contactMethod, contactValue } = req.body;
    try {
        const db = await readDB();
        const newOrder = {
            id: Date.now().toString(),
            first_name: firstName || 'Instant Order',
            last_name: lastName || '',
            email: email || '',
            phone: phone || '',
            contactMethod: contactMethod || (email ? 'email' : (phone ? 'phone' : 'general')),
            contactValue: contactValue || email || phone || '',
            service: itemTitle || service || 'General',
            details: details || '',
            audioUrl: audioUrl || null,
            screenshotUrl: screenshotUrl || null,
            status: 'pending',
            paid: false,
            created_at: new Date().toISOString()
        };
        db.orders.push(newOrder);
        await writeDB(db);
        res.json(newOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/orders/:id/paid', async (req, res) => {
    const { id } = req.params;
    const { paid } = req.body;
    try {
        const db = await readDB();
        const orderIndex = db.orders.findIndex(o => o.id === id);
        if (orderIndex > -1) {
            db.orders[orderIndex].paid = paid;
            await writeDB(db);
            
            // Trigger notification
            const order = db.orders[orderIndex];
            if(paid) await sendNotification(order, 'paid');
            
            res.json({ success: true, notified: true });
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`🟢 INCOMING API CALL: Status Update for ID ${id} -> ${status}`);
    try {
        const db = await readDB();
        const orderIndex = db.orders.findIndex(o => o.id === id);
        if (orderIndex > -1) {
            db.orders[orderIndex].status = status;
            await writeDB(db);
            
            // Trigger notification
            const order = db.orders[orderIndex];
            await sendNotification(order, status);
            
            res.json({ success: true, notified: true });
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await readDB();
        db.orders = db.orders.filter(o => o.id !== id);
        await writeDB(db);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========================
// POSTS (Blog/News/Services) API
// ========================
app.get('/api/posts', async (req, res) => {
    try {
        const db = await readDB();
        res.json([...db.posts].reverse());
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/posts', async (req, res) => {
    const { title, content, category, subCategory, image, price } = req.body;
    try {
        const db = await readDB();
        const newPost = {
            id: Date.now().toString(),
            title,
            content,
            price: price || '',
            category: category || 'General',
            subCategory: subCategory || '',
            image: image || '',
            created_at: new Date().toISOString()
        };
        db.posts.push(newPost);
        await writeDB(db);
        res.json(newPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, category, subCategory, image, price } = req.body;
    try {
        const db = await readDB();
        const postIndex = db.posts.findIndex(p => p.id === id);
        if (postIndex > -1) {
            db.posts[postIndex] = {
                ...db.posts[postIndex],
                title, content, category, subCategory, image, price
            };
            await writeDB(db);
            res.json(db.posts[postIndex]);
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await readDB();
        db.posts = db.posts.filter(p => p.id !== id);
        await writeDB(db);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========================
// CUSTOMER INTERACTIONS LIKES & COMMENTS API
// ========================
app.put('/api/posts/:id/like', async (req, res) => {
    try {
        const db = await readDB();
        const post = db.posts.find(p => p.id === req.params.id);
        const user = req.body.user; // { name, contactMethod, contactValue }
        if (post) {
            post.likes = (post.likes || 0) + 1;
            if (user) {
                if (!post.likeLog) post.likeLog = [];
                post.likeLog.push({ user, date: new Date().toISOString() });
            }
            await writeDB(db);
            res.json({ likes: post.likes });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/posts/:id/comment', async (req, res) => {
    try {
        const db = await readDB();
        const post = db.posts.find(p => p.id === req.params.id);
        const user = req.body.user;
        if (post) {
            if (!post.comments) post.comments = [];
            const newComment = { 
                id: Date.now().toString(), 
                text: req.body.text, 
                user: user || null,
                date: new Date().toISOString() 
            };
            post.comments.push(newComment);
            await writeDB(db);
            res.json(newComment);
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/posts/:postId/comment/:commentId', async (req, res) => {
    try {
        const db = await readDB();
        const post = db.posts.find(p => p.id === req.params.postId);
        if (post && post.comments) {
            post.comments = post.comments.filter(c => c.id !== req.params.commentId);
            await writeDB(db);
            res.json({ message: 'Comment deleted' });
        } else {
            res.status(404).json({ error: 'Post or comment not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========================
// SETTINGS (Web Info) API
// ========================
app.get('/api/settings', async (req, res) => {
    try {
        const db = await readDB();
        res.json(db.settings || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/settings', async (req, res) => {
    const settings = req.body; // { phone, email, address }
    try {
        const db = await readDB();
        db.settings = { ...db.settings, ...settings };
        await writeDB(db);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// NEW: Telegram Polling to map @username -> chat_id
let lastUpdateId = 0;
async function pollTelegramUpdates() {
    if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'your_telegram_bot_token_here') return;
    
    console.log(`🔍 Checking for Telegram updates... [Token: ${process.env.TELEGRAM_BOT_TOKEN.slice(0, 5)}...]`);
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const data = await res.json();
        
        if (data.ok && data.result.length > 0) {
            const rawMap = await fs.readFile(TG_MAP_FILE, 'utf8');
            const mapData = JSON.parse(rawMap);
            
            data.result.forEach(update => {
                lastUpdateId = update.update_id;
                if (update.message) {
                    const chatId = update.message.chat.id;
                    const from = update.message.from;
                    
                    // A. Map by Username
                    if (from && from.username) {
                        const key = `@${from.username.toLowerCase()}`;
                        if (mapData[key] !== chatId) {
                             mapData[key] = chatId;
                             console.log(`📝 Learned Telegram Mapping: ${key} -> ${chatId}`);
                        }
                    }
                    
                    // C. Deep-Link Mapping (/start order_12345)
                    if (update.message.text && update.message.text.startsWith('/start order_')) {
                        const orderId = update.message.text.split(' ')[1].replace('order_', '');
                        const key = `order_${orderId}`;
                        if (mapData[key] !== chatId) {
                             mapData[key] = chatId;
                             console.log(`📝 Learned Order mapping: ${key} -> ${chatId}`);
                             
                             // Optional: Send a confirmation message to user
                             fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({
                                     chat_id: chatId,
                                     text: `✅ Subscription Successful! You will now receive status updates here for Order #${orderId}.`
                                 })
                             }).catch(() => {});
                        }
                    }
                }
            });
            await fs.writeFile(TG_MAP_FILE, JSON.stringify(mapData, null, 2));
        }
    } catch (e) {
        console.error('❌ Telegram Polling Error:', e.message);
    }
    
    // Continues polling every 10 seconds to avoid flooding
    setTimeout(pollTelegramUpdates, 10000);
}

// SPA Catch-all: If the request is NOT for an API or an image, serve the React APP
app.get('*', (req, res) => {
    // Only serve index.html for non-API, non-Uploads, non-Static-File-looking requests
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return res.status(404).json({ error: 'Resource not found' });
    }
    // Serve index.html from dist
    const indexPath = path.join(__dirname, '../dist', 'index.html');
    res.sendFile(indexPath);
});

// Initialize DB then start server
initializeDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Shikret API running cleanly on http://localhost:${PORT}`);
        console.log(`📁 Using JSON File Database at: ${DB_FILE}`);
        pollTelegramUpdates(); // Start bot mapping service
    });
}).catch(err => {
    console.error('❌ Failed to initialize JSON database:', err);
});

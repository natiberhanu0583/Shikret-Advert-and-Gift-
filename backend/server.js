import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Set up Multer for local disk storage
const uploadDir = path.join(__dirname, 'uploads');
// Create directory asynchronously in background
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

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
    res.json({ url: `http://localhost:3001/uploads/${req.file.filename}` });
});

app.post('/api/upload-audio', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio uploaded.' });
    }
    res.json({ url: `http://localhost:3001/uploads/${req.file.filename}` });
});

// JSON File Database setup
const DB_FILE = path.join(__dirname, 'database.json');

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

// Helper: Simulate sending status notification to customer
async function sendNotification(order, status) {
    const method = order.contactMethod || (order.email ? 'email' : (order.phone ? 'phone' : 'general'));
    const value = order.contactValue || order.email || order.phone || 'no contact info';
    const orderTitle = order.service || 'Order';
    
    let msg = `Hello ${order.first_name} ${order.last_name || ''}! Your order [${orderTitle}] status updated: **${status.toUpperCase()}**.`;
    if(status === 'delivered') {
       msg = ` 🎉 Congratulations ${order.first_name}! Your Project [${orderTitle}] has been DELIVERED! Thank you for choosing Shikret.`;
    } else if(status === 'paid') {
       msg = ` ✅ Payment Received! We are now processing your [${orderTitle}] project.`;
    }

    console.log(`\n=========================================`);
    console.log(`🔔 STATUS NOTIFICATION TO CUSTOMER`);
    console.log(`👤 Customer: ${order.first_name} ${order.last_name || ''}`);
    console.log(`📱 Platform: ${method.toUpperCase()}`);
    console.log(`🆔 Contact Detail: ${value}`);
    console.log(`📝 Message: ${msg}`);
    console.log(`=========================================\n`);
    
    // In production, integration with Telegram Bot API, SendGrid (Email), or Twilio (SMS) would happen here.
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

// Initialize DB then start server
initializeDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Shikret API running cleanly on http://localhost:${PORT}`);
        console.log(`📁 Using JSON File Database at: ${DB_FILE}`);
    });
}).catch(err => {
    console.error('❌ Failed to initialize JSON database:', err);
});

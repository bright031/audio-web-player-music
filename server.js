const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Removed jwt require
const cors = require('cors');

const app = express();
app.use(express.json());

const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

const { songs } = require('./dtsongs.js');

mongoose.connect('mongodb://localhost:27017/audiora_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
  });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'] },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log('Received /register request:', { username, email, password });
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
        }
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'Tên người dùng đã tồn tại!' });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email đã được sử dụng!' });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        console.log('User saved:', user);
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received /login request:', { username, password });
    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập username và password!' });
        }
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ message: 'Người dùng không tồn tại!' });
        }
        console.log('User found:', user.username, user.email);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(400).json({ message: 'Mật khẩu sai!' });
        }
        // Removed token generation
        console.log('Login successful for user:', username);
        res.json({ message: 'Đăng nhập thành công!', username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});

app.get('/songs', (req, res) => {
    res.json(songs);
});
const ContactSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    songRequest: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', ContactSchema);

// API để lưu dữ liệu liên hệ
app.post('/contact', async (req, res) => {
    const { fullName, songRequest, message } = req.body;
    console.log('Received /contact request:', { fullName, songRequest, message });
    try {
        if (!fullName || !songRequest || !message) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
        }
        const contact = new Contact({ fullName, songRequest, message });
        await contact.save();
        console.log('Contact saved:', contact);
        res.status(201).json({ message: 'Gửi thông tin thành công!' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});

// API để lấy danh sách liên hệ (dành cho admin)
app.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }); // Sắp xếp mới nhất trước
        res.json(contacts);
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});
app.post('/songs', async (req, res) => {
    const { name, artist, src, cover } = req.body;
    if (!name || !artist) {
        return res.status(400).json({ message: 'Vui lòng nhập tên bài hát và nghệ sĩ!' });
    }
    const newSong = { name, artist, src: src || null, cover: cover || 'img/default_cover.png' };
    songs.push(newSong);
    res.json({ message: `Đã thêm bài "${name}" của ${artist}` });
});

const PORT = process.env.PORT || 27016;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const FavoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    song: {
        name: { type: String, required: true },
        artist: { type: String, required: true },
        src: { type: String, required: true },
        cover: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});
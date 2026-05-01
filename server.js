import express from 'express';
import BookingService from './services/BookingService.js';

const app = express();
const ADMIN_PASSWORD = "admin123"; // Change this to your desired password

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader === ADMIN_PASSWORD) {
        next(); // Password is correct, proceed to the route
    } else {
        res.status(401).json({ error: "Unauthorized: Invalid Password" });
    }
};


app.use('/api/admin', authenticate);

app.use(express.json());
app.use(express.static('public'));

app.get('/api/rooms', async (req, res) => {
    try { res.json(await BookingService.getRooms()); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/room/:id/schedule', async (req, res) => {
    try { res.json(await BookingService.getByRoom(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reserve', async (req, res) => {
    try {
        const result = await BookingService.create(req.body);
        res.status(201).json({ success: true, id: result.id });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Add these routes to server.js

// Route to get all bookings for the admin table[cite: 6]
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await BookingService.getAll();
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Route to delete a booking[cite: 6]
app.delete('/api/admin/bookings/:id', async (req, res) => {
    try {
        await BookingService.delete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// server.js

app.post('/api/admin/rooms', async (req, res) => {
    try {
        const { name, capacity } = req.body;
        const result = await BookingService.addRoom(name, capacity);
        res.status(201).json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/rooms/:id', async (req, res) => {
    try {
        const { name, capacity } = req.body;
        await BookingService.updateRoom(req.params.id, name, capacity);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/rooms/:id', async (req, res) => {
    try {
        await BookingService.deleteRoom(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});



//app.listen(3000, () => console.log(`🚀 Server running at http://localhost:3000`));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});
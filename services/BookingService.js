import db from '../models/database.js';

class BookingService {
    static async checkConflict(roomId, start, end, excludeId = null) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT id FROM bookings WHERE room_id = ? AND (start_time < ? AND end_time > ?)`;
            let params = [roomId, end, start];
            if (excludeId) { sql += ` AND id != ?`; params.push(excludeId); }
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                resolve(row ? true : false);
            });
        });
    }

    static async getRooms() {
        return new Promise((res, rej) => {
            db.all("SELECT * FROM rooms", [], (err, rows) => { if (err) rej(err); res(rows); });
        });
    }

	static async getByRoom(roomId) {
			return new Promise((res, rej) => {
				// Fetches all bookings from the start of the current month onwards
				const sql = `SELECT user_name, start_time, end_time FROM bookings 
						WHERE room_id = ? 
						AND start_time >= date('now', 'start of month')
						ORDER BY start_time ASC`;
				db.all(sql, [roomId], (err, rows) => { 
				if (err) rej(err); 
				res(rows); 
			});
		});
	}

    static async create(data) {
        const hasConflict = await this.checkConflict(data.roomId, data.start, data.end);
        if (hasConflict) throw new Error("This room is already booked for the selected time.");

        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO bookings (room_id, user_name, start_time, end_time) VALUES (?, ?, ?, ?)`;
            db.run(sql, [data.roomId, data.user, data.start, data.end], function(err) {
                if (err) reject(err);
                resolve({ id: this.lastID });
            });
        });
    }

    // Add these to your BookingService class in services/BookingService.js[cite: 10]

static async getAll() {
    return new Promise((res, rej) => {
        // We use LEFT JOIN so bookings appear even if the room record is missing
        const sql = `SELECT b.*, r.name as room_name 
                     FROM bookings b 
                     LEFT JOIN rooms r ON b.room_id = r.id 
                     ORDER BY b.start_time DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("SQL Error in getAll:", err.message);
                rej(err);
            }
            res(rows || []); 
        });
    });
}




static async delete(id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM bookings WHERE id = ?`, [id], function(err) {
            if (err) reject(err);
            resolve({ success: true });
        });
    });
}

// Add these to BookingService class in services/BookingService.js

static async addRoom(name, capacity) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO rooms (name, capacity) VALUES (?, ?)`;
        db.run(sql, [name, capacity], function(err) {
            if (err) reject(err);
            resolve({ id: this.lastID });
        });
    });
}

static async updateRoom(id, name, capacity) {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE rooms SET name = ?, capacity = ? WHERE id = ?`;
        db.run(sql, [name, capacity, id], (err) => {
            if (err) reject(err);
            resolve({ success: true });
        });
    });
}

static async deleteRoom(id) {
    return new Promise((resolve, reject) => {
        // Warning: This will leave "orphan" bookings if not handled, 
        // but for now, we simply delete the room.
        db.run(`DELETE FROM rooms WHERE id = ?`, [id], (err) => {
            if (err) reject(err);
            resolve({ success: true });
        });
    });
}


}

export default BookingService;
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Importing the database connection
const app = express();
const port = 3000;

app.use(bodyParser.json());



// Create course API
app.post('/courses', async (req, res) => {
    let { instructor_id, name, max_seats, start_date } = req.body;

    // Parse integers
    instructor_id = parseInt(instructor_id);
    max_seats = parseInt(max_seats);

    // Validate input
    if (!instructor_id || isNaN(instructor_id) ||
        !name.trim() ||
        isNaN(max_seats) || max_seats <= 0 ||
        !start_date || isNaN(Date.parse(start_date))) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const sql = `INSERT INTO Courses (instructor_id, name, max_seats, start_date) VALUES (?, ?, ?, ?)`;
        await db.query(sql, [instructor_id, name, max_seats, start_date]);
        res.status(201).json({ message: 'Course created successfully' });
    } catch (err) {
        console.error('Error creating course:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Update course details API
app.put('/courses/:courseId', async (req, res) => {
    const courseId = req.params.courseId;
    let { name, max_seats, start_date } = req.body;

    // Parse integers
    max_seats = parseInt(max_seats);

    // Parse strings
    name = String(name);
    start_date = String(start_date);

    // Validate input
    if (!name.trim() || isNaN(max_seats) || max_seats <= 0 || !start_date || isNaN(Date.parse(start_date))) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const sql = `UPDATE Courses SET name=?, max_seats=?, start_date=? WHERE course_id=?`;
        await db.query(sql, [name, max_seats, start_date, courseId]);
        res.status(200).json({ message: 'Course details updated successfully' });
    } catch (err) {
        console.error('Error updating course details:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Course registration API
app.post('/courses/:courseId/register', async (req, res) => {
    const courseId = req.params.courseId;
    let { name, email, phone, linkedin_profile } = req.body;

    // Parse strings
    name = String(name);
    email = String(email);
    phone = String(phone);
    linkedin_profile = String(linkedin_profile);

    // Validate input
    if (!name.trim() || !email.trim() || !phone.trim() || !linkedin_profile.trim()) {
        return res.status(400).json({ message: 'Name, email, phone, and linkedin_profile are required fields' });
    }

    try {
        const sql = `INSERT INTO Leads (course_id, name, email, phone, linkedin_profile, status) VALUES (?, ?, ?, ?, ?, 'Pending')`;
        await db.query(sql, [courseId, name, email, phone, linkedin_profile]);
        res.status(201).json({ message: 'Registered for the course successfully' });
    } catch (err) {
        console.error('Error registering for the course:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Lead update API
app.put('/leads/:leadId', async (req, res) => {
    const leadId = req.params.leadId;
    const { status } = req.body;

    // Validate input
    if (!status || !['Accepted', 'Rejected', 'Pending', 'Waitlisted'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be one of Accepted, Rejected, Pending, or Waitlisted' });
    }

    try {
        const sql = `UPDATE Leads SET status=? WHERE lead_id=?`;
        await db.query(sql, [status, leadId]);
        res.status(200).json({ message: 'Lead status updated successfully' });
    } catch (err) {
        console.error('Error updating lead status:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Lead search API
app.get('/leads', async (req, res) => {
    let { name, email } = req.query;

    // Convert to string if not already
    if (name && typeof name !== 'string') {
        name = String(name);
    }
    if (email && typeof email !== 'string') {
        email = String(email);
    }

    try {
        let sql = `SELECT * FROM Leads WHERE 1`;
        if (name) sql += ` AND name LIKE '%${name}%'`;
        if (email) sql += ` AND email LIKE '%${email}%'`;
        const leads = await db.query(sql);
        res.status(200).json(leads);
    } catch (err) {
        console.error('Error fetching leads:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Add comment API
app.post('/comments', async (req, res) => {
    let { lead_id, instructor_id, comment } = req.body;

    // Parse integers
    lead_id = parseInt(lead_id);
    instructor_id = parseInt(instructor_id);

    // Parse strings
    comment = String(comment);

    // Validate input
    if (!lead_id || isNaN(lead_id) || !instructor_id || isNaN(instructor_id) || !comment) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const sql = `INSERT INTO Comments (lead_id, instructor_id, comment) VALUES (?, ?, ?)`;
        await db.query(sql, [lead_id, instructor_id, comment]);
        res.status(201).json({ message: 'Comment added successfully' });
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../../models');
const filePath = path.join(__dirname, '../../utils/admins/administrators.json');
// endpoint GET /api/admin
router.get('/', (req, res) => {
    try {
        const administratorsRaw = fs.readFileSync(filePath, 'utf8');
        const administrators = JSON.parse(administratorsRaw);
        console.log(administrators); // This will log the parsed JSON object
        res.json(administrators); // Send the parsed JSON directly
    } catch (error) {
        console.error('Error fetching administrators:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// endpoint POST /api/admin
router.post('/', async (req, res) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check if the user exists in the Volunteer model
        const existingVolunteer = await db.Volunteers.findOne({ where: { email } });

        if (!existingVolunteer) {
            return res.status(400).json({ error: 'The selected user does not have an account. Admin appointment cannot be completed until they create an account first.' });
        }

        const administratorsRaw = fs.readFileSync(filePath, 'utf8');
        const administrators = JSON.parse(administratorsRaw);

        // Check if the admin already exists
        const existingAdmin = administrators.Administrators.find(admin => admin.email === email);
        if (existingAdmin) {
            return res.status(400).json({ error: 'This user is already an administrator.' });
        }

        const newAdmin = {
            id: administrators.Administrators.length + 1,
            name,
            email
        };

        administrators.Administrators.push(newAdmin);

        fs.writeFileSync(filePath, JSON.stringify(administrators, null, 2));

        // Update the Volunteer model
        await db.Volunteers.update({ VolunteerType: 'Admin' }, { where: { email } });

        res.status(201).json(newAdmin);
    } catch (error) {
        console.error('Error adding administrator:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// endpoint DELETE /api/admin/:id
router.delete('/:id', async (req, res) => {
    try {
        const adminId = parseInt(req.params.id);

        const administratorsRaw = fs.readFileSync(filePath, 'utf8');
        const administrators = JSON.parse(administratorsRaw);

        if (administrators.Administrators.length <= 1) {
            return res.status(400).json({ error: 'Cannot delete the last administrator' });
        }

        const adminToDelete = administrators.Administrators.find(admin => admin.id === adminId);

        if (!adminToDelete) {
            return res.status(404).json({ error: 'Administrator not found' });
        }

        administrators.Administrators = administrators.Administrators.filter(admin => admin.id !== adminId);

        // Reassign IDs to ensure they remain sequential
        administrators.Administrators = administrators.Administrators.map((admin, idx) => ({
            ...admin,
            id: idx + 1
        }));

        fs.writeFileSync(filePath, JSON.stringify(administrators, null, 2));

        // Update the Volunteer model
        await db.Volunteers.update({ VolunteerType: null }, { where: { email: adminToDelete.email } });

        res.status(200).json({ message: 'Administrator deleted successfully' });
    } catch (error) {
        console.error('Error deleting administrator:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
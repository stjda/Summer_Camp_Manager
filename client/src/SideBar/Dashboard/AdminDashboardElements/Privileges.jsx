import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Snackbar, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';

export const AdminPrivileges = () => {
    const [administrators, setAdministrators] = useState([]);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        fetchAdministrators();
    }, []);

    const fetchAdministrators = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/admin');
            if (!response.ok) {
                throw new Error('Failed to fetch administrators');
            }
            const data = await response.json();
            setAdministrators(data.Administrators);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAdmin = async () => {
        setConfirmDialog({
            open: true,
            title: 'Add Administrator',
            message: `Are you sure you want to add ${newAdmin.name} as an administrator?`,
            onConfirm: async () => {
                try {
                    const response = await fetch('http://localhost:3000/api/admin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newAdmin),
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    const addedAdmin = await response.json();
                    setAdministrators([...administrators, addedAdmin]);
                    setNewAdmin({ name: '', email: '' });
                    setSnackbar({ open: true, message: 'Administrator added successfully', severity: 'success' });
                } catch (err) {
                    setSnackbar({ open: true, message: err.message, severity: 'error' });
                }
            }
        });
    };

    const handleRemoveAdmin = async (id, name) => {
        setConfirmDialog({
            open: true,
            title: 'Remove Administrator',
            message: `Are you sure you want to remove ${name} as an administrator?`,
            onConfirm: async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/admin/${id}`, { method: 'DELETE' });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to remove administrator');
                    }
                    await fetchAdministrators();
                    setSnackbar({ open: true, message: 'Administrator removed successfully', severity: 'success' });
                } catch (err) {
                    setSnackbar({ open: true, message: err.message, severity: 'error' });
                }
            }
        });
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Admin Privileges</Typography>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Add New Administrator</Typography>
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddAdmin(); }} sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Name"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        required
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        required
                    />
                    <Button type="submit" variant="contained">Add Administrator</Button>
                </Box>
            </Paper>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {administrators.map((admin) => (
                            <TableRow key={admin.id}>
                                <TableCell>{admin.id}</TableCell>
                                <TableCell>{admin.name}</TableCell>
                                <TableCell>{admin.email}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleRemoveAdmin(admin.id, admin.name)} disabled={administrators.length <= 1}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
                <DialogTitle>{confirmDialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{confirmDialog.message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
                    <Button onClick={() => {
                        confirmDialog.onConfirm();
                        setConfirmDialog({ ...confirmDialog, open: false });
                    }} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};
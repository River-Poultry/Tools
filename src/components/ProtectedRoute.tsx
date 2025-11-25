import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';

interface ProtectedRouteProps {
    children: React.ReactNode;
    password?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    password = 'admin2025' // Change this to your secure password
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputPassword, setInputPassword] = useState('');
    const [error, setError] = useState('');

    // Check if already authenticated in this session
    useEffect(() => {
        const auth = sessionStorage.getItem('admin_authenticated');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (inputPassword === password) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_authenticated', 'true');
            setError('');
        } else {
            setError('Incorrect password');
            setInputPassword('');
        }
    };

    if (!isAuthenticated) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                }}
            >
                <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Lock sx={{ fontSize: 48, color: '#2E7D32', mb: 2 }} />
                            <Typography variant="h5" fontWeight="bold" color="#2E7D32">
                                Admin Access
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                Enter password to view leads dashboard
                            </Typography>
                        </Box>

                        <form onSubmit={handleLogin}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Password"
                                value={inputPassword}
                                onChange={(e) => setInputPassword(e.target.value)}
                                error={!!error}
                                helperText={error}
                                sx={{ mb: 3 }}
                                autoFocus
                            />
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                color="success"
                                size="large"
                            >
                                Login
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;

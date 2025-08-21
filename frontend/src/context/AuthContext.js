import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    const response = await api.get('/users/me');
                    setUser(response.data);
                    setToken(storedToken);
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];
                    setUser(null);
                    setToken(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;
            
            const userToken = data.token;
            const userData = {
                _id: data._id,
                name: data.name,
                email: data.email,
                role: data.role,
                location: data.location,
                points: data.points || 0,
                volunteerStatus: data.volunteerStatus
            };

            localStorage.setItem('token', userToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

            setUser(userData);
            setToken(userToken);
            setIsAuthenticated(true);
            setLoading(false);

            toast.success('Login successful!');
            navigate(userData.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/register', userData);
            const { token: userToken, user: userInfo } = response.data;

            localStorage.setItem('token', userToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

            setUser(userInfo);
            setToken(userToken);
            setIsAuthenticated(true);
            setLoading(false);

            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (error) {
            setLoading(false);
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        navigate('/');
        toast.success('Logged out successfully');
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const value = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
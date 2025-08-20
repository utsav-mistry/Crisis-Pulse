import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const navigate = useNavigate();

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                // Set the token in api defaults immediately
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await api.get('/api/users/me');
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: { user: response.data, token },
                    });
                } catch (error) {
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];
                    dispatch({ type: 'LOGIN_FAILURE' });
                }
            } else {
                dispatch({ type: 'LOGIN_FAILURE' });
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token },
            });

            toast.success('Login successful!');

            // Redirect based on user role
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE' });
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (userData) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await api.post('/api/auth/register', userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token },
            });

            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE' });
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        dispatch({ type: 'LOGOUT' });
        navigate('/');
        toast.success('Logged out successfully');
    };

    const updateUser = (userData) => {
        dispatch({ type: 'UPDATE_USER', payload: userData });
    };

    const value = {
        ...state,
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
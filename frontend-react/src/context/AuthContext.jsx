import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            checkUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const checkUser = async (token) => {
        try {
            const response = await axios.get('/api/v1/auth/me');
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axios.post('/api/v1/auth/login', formData);
        const { access_token } = response.data;

        localStorage.setItem('token', access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        const userResponse = await axios.get('/api/v1/auth/me');
        setUser(userResponse.data);
        return userResponse.data;
    };

    const signup = async (email, password, name) => {
        await axios.post('/api/v1/auth/signup', { email, password, name });
        return login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

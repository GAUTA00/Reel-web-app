// api/auth.js

const BASE_URL = 'http://localhost:8080';

export const registerUser = async (formData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
};

export const loginUser = async (formData) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
};

export const loginWithGoogle = async (code) => {
    const res = await axios.get(`http://localhost:8080/auth/google?code=${code}`);
    return res.data;
};
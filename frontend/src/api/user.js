// src/api/user.js

const BASE_URL = 'http://localhost:8080';

export const getMyProfile = async (token) => {
    const res = await fetch(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
};

export const followUser = async (userId, token) => {
    const res = await fetch(`${BASE_URL}/users/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to follow user');
    return data;
};

export const unfollowUser = async (userId, token) => {
    const res = await fetch(`${BASE_URL}/users/unfollow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to unfollow user');
    return data;
};

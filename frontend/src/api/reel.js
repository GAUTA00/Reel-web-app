// src/api/reel.js

const BASE_URL = 'http://localhost:8080';

export const fetchComments = async (reelId) => {
    const res = await fetch(`${BASE_URL}/reels/${reelId}/comments`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch comments');
    return data;
};

export const addComment = async (reelId, comment, token, parentId = null) => {
    const res = await fetch(`${BASE_URL}/reels/${reelId}/comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment, parentId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add comment');
    return data;
};

export const deleteComment = async (commentId, token) => {
    const res = await fetch(`${BASE_URL}/reels/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete comment');
    return data;
};

export const likeReel = async (reelId, token) => {
    const res = await fetch(`${BASE_URL}/reels/${reelId}/like`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to like reel');
    return data;
    return data;
};

export const fetchReels = async (page = 1, limit = 5) => {
    const res = await fetch(`${BASE_URL}/reels/all?page=${page}&limit=${limit}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch reels');
    return data;
};

export const fetchFollowingReels = async (page = 1, limit = 5, token) => {
    const res = await fetch(`${BASE_URL}/reels/following?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch following reels');
    return data;
};

export const viewReel = async (reelId) => {
    try {
        await fetch(`${BASE_URL}/reels/${reelId}/view`, { method: 'POST' });
    } catch (e) {
        console.error('Failed to count view', e);
    }
};

export const shareReel = async (reelId) => {
    try {
        const res = await fetch(`${BASE_URL}/reels/${reelId}/share`, { method: 'POST' });
        return await res.json();
    } catch (e) {
        console.error('Failed to share', e);
    }
};

export const deleteReel = async (reelId, token) => {
    const res = await fetch(`${BASE_URL}/reels/${reelId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete reel');
    return data;
};

export const fetchLikedReels = async (token) => {
    const res = await fetch(`${BASE_URL}/reels/liked`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch liked reels');
    return data;
};

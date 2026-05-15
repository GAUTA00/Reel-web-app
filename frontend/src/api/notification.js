const BASE_URL = 'http://localhost:8080';

export const getNotifications = async (token) => {
    const res = await fetch(`${BASE_URL}/notifications`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
    return data;
};

export const markAsRead = async (id, token) => {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to mark as read');
    return data;
};

export const markAllAsRead = async (token) => {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to mark all as read');
    return data;
};

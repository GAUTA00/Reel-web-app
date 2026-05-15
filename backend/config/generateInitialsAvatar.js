export function generateInitialsAvatar(name) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

    const url = `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&bold=true&size=128`;
    return url;
}

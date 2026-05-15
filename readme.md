# Reelify - Short Video/Reel App

Reelify is a modern full-stack short video/reel sharing platform inspired by Instagram Reels and TikTok. It allows users to upload, view, like, comment, and interact with short videos in a beautiful, mobile-friendly UI. The project is built with React (Vite, Tailwind CSS) for the frontend and Node.js/Express with MongoDB for the backend.

---

## ✨ Features

- **User Authentication**: Register, login, and Google OAuth support.
- **Profile Management**: View and update your profile, including avatar and name.
- **Short Video Feed**: Browse a feed of short videos with smooth playback and progress bar.
- **Like/Unlike**: Instantly like or unlike reels with animated heart feedback.
- **Follow/Unfollow**: Follow or unfollow other users, with real-time button state.
- **Comment System**: Add, view, and delete comments on reels. Comments modal is mobile-style, scrollable, and animated.
- **Upload Reels**: Upload your own short videos (MP4), with progress and preview.
- **Responsive UI**: Fully responsive, mobile-first design with beautiful modals and transitions.
- **Centralized API Layer**: All API calls are organized in the `src/api/` folder for maintainability.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Lucide Icons, React Toastify
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, Google OAuth
- **File Uploads**: Multer

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/reelify.git
cd reelify
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../my-app
npm install
```

### 3. Set Up Environment Variables

- Create a `.env` file in the `backend/` folder with your MongoDB URI, JWT secret, and Google OAuth credentials.
- Example:
  ```env
  MONGO_URI=your_mongodb_uri
  JWT_SECRET=your_jwt_secret
  GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  ```

### 4. Start the Development Servers

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd ../my-app
npm run dev
```

The backend runs on `http://localhost:8080` and the frontend on `http://localhost:5173` by default.

---

## 🧑‍💻 Project Structure

```
reelify/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── ...
├── my-app/
│   ├── src/
│   │   ├── api/           # All API calls (auth.js, reel.js, user.js)
│   │   ├── components/    # UI components (ReelCard, etc.)
│   │   ├── pages/         # Page components (Login, Signup, Feed, etc.)
│   │   ├── context/       # React context (Auth)
│   │   ├── utils/         # Utility functions
│   │   └── ...
│   └── ...
└── readme.md
```

---

## 📝 Functionality Overview

- **Authentication**: Secure JWT-based login/register, Google OAuth, and protected routes.
- **Feed**: Infinite scroll of short videos, each with like, comment, and follow actions.
- **Comments**: Real-time add/delete, modal UI, user avatars, and timestamps.
- **Likes**: Animated heart, instant feedback, and like count.
- **Follow System**: Follow/unfollow users, with backend and frontend sync.
- **Profile**: View your own and others' profiles, see uploaded reels and stats.
- **Upload**: Drag-and-drop or select video files, with upload progress.
- **API Layer**: All API logic is in `src/api/` for easy reuse and testing.

---

## 🧪 Cloning & Running Locally

1. Clone the repo and install dependencies as above.
2. Set up your `.env` file in `backend/`.
3. Start both backend and frontend servers.
4. Open `http://localhost:5173` in your browser.
5. Register a new account or use Google login.
6. Start uploading, liking, commenting, and following!

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- Inspired by Instagram Reels, TikTok, and other short video platforms.
- Built with love using React, Node.js, and MongoDB.

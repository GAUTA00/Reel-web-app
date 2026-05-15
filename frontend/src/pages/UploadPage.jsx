import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Film, Loader2 } from 'lucide-react';

export default function UploadPage() {
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        } else {
            alert("Please select a valid video file.");
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!videoFile || !title) return alert("Please add a video and caption.");

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', title);

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8080/reels/upload', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            navigate('/feed');
        } catch (err) {
            console.error(err);
            alert('Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setVideoFile(null);
        setVideoPreview(null);
        setTitle('');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col p-6 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition">
                    Cancel
                </button>
                <h1 className="text-lg font-bold tracking-wide">NEW POST</h1>
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                ) : (
                    <button
                        onClick={handleUpload}
                        className="text-pink-500 font-bold hover:text-pink-400 disabled:opacity-50 transition"
                        disabled={!videoFile || !title}
                    >
                        Share
                    </button>
                )}
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-8 max-w-5xl mx-auto w-full">
                {/* 1. Video Preview / Dropzone */}
                <div className="flex-1 flex flex-col">
                    {!videoPreview ? (
                        <div
                            className={`flex opacity-60 flex-col items-center justify-center flex-1 min-h-[400px] border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer text-gray-400 hover:text-white hover:border-gray-500 hover:bg-white/5 ${dragActive ? "border-pink-500 bg-pink-500/10 text-pink-500" : "border-gray-800"}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                accept="video/*"
                                onChange={handleChange}
                            />
                            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="font-semibold text-lg">Select video to upload</p>
                            <p className="text-sm text-gray-500 mt-2">or drag and drop a file</p>
                            <p className="text-xs text-gray-600 mt-8">MP4 or WebM • 720x1280 or higher • Up to 10 minutes</p>
                        </div>
                    ) : (
                        <div className="relative flex-1 min-h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl group border border-gray-800">
                            <video
                                src={videoPreview}
                                className="w-full h-full object-cover"
                                controls={false}
                                autoPlay
                                loop
                                muted
                            />
                            {/* Overlay Controls */}
                            <button
                                onClick={clearSelection}
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-red-500/80 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md backdrop-blur-sm text-xs font-mono border border-white/10 flex items-center gap-2">
                                <Film className="w-3 h-3 text-pink-500" />
                                <span>PREVIEW MODE</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Metadata Input */}
                {videoPreview && (
                    <div className="w-full md:w-80 flex flex-col gap-6 animate-slideUp">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-400">Caption</label>
                            <textarea
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Write a caption... #hashtags"
                                className="w-full bg-transparent text-white text-lg border-b border-gray-800 focus:border-white outline-none py-2 resize-none min-h-[100px] placeholder-gray-600 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-4 text-sm text-gray-500">
                            <div className="flex justify-between items-center py-3 border-b border-gray-900">
                                <span>Who can view this video</span>
                                <span className="text-gray-300">Public</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-900">
                                <span>Allow comments</span>
                                <span className="text-pink-500 font-bold">On</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-900">
                                <span>High quality upload</span>
                                <span className="text-pink-500 font-bold">On</span>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 mt-auto">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                By posting, you agree to our Terms of Service. Please ensure you own the rights to the music and video used.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

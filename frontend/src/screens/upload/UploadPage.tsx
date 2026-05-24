// src/screens/upload/UploadPage.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Film, Loader2, Music2 } from 'lucide-react';
import { useUpload } from './useUpload';

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function UploadPage() {
  const navigate = useNavigate();
  const { mutate: uploadReel, isPending, progress } = useUpload();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [music, setMusic] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File is too large (${formatFileSize(file.size)}). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!videoFile || !title) return alert('Please add a video and caption.');

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', title);
    if (music.trim()) formData.append('music', music.trim());
    uploadReel(formData);
  };

  const clearSelection = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setTitle('');
    setMusic('');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-6 animate-fade-in font-sans">
      {/* Progress bar during upload */}
      {isPending && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
          <p className="text-white font-semibold text-lg">Uploading your reel...</p>
          {progress !== null && (
            <div className="w-64">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition">Cancel</button>
        <h1 className="text-lg font-bold tracking-wide">NEW POST</h1>
        {isPending ? (
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
        {/* Video / Dropzone */}
        <div className="flex-1 flex flex-col">
          {!videoPreview ? (
            <div
              className={`flex opacity-60 flex-col items-center justify-center flex-1 min-h-[400px] border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer text-gray-400 hover:text-white hover:border-gray-500 hover:bg-white/5 ${dragActive ? 'border-pink-500 bg-pink-500/10 text-pink-500' : 'border-gray-800'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" className="hidden" accept="video/*" onChange={handleChange} />
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-semibold text-lg">Select video to upload</p>
              <p className="text-sm text-gray-500 mt-2">or drag and drop a file</p>
          <p className="text-xs text-gray-600 mt-8">MP4 or WebM • Up to {MAX_FILE_SIZE_MB}MB</p>
            </div>
          ) : (
            <div className="relative flex-1 min-h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl group border border-gray-800">
              <video src={videoPreview} className="w-full h-full object-cover" controls={false} autoPlay loop muted />
              <button onClick={clearSelection} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-red-500/80 transition">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md backdrop-blur-sm text-xs font-mono border border-white/10 flex items-center gap-2">
                <Film className="w-3 h-3 text-pink-500" />
                <span>PREVIEW MODE</span>
                {videoFile && (
                  <span className="text-gray-400 ml-2">({formatFileSize(videoFile.size)})</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
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
              {title && /#[a-z0-9_]+/i.test(title) && (
                <p className="text-sm text-pink-400 mt-1">
                  {(title.match(/#[a-z0-9_]+/gi) || []).join(' ')}
                </p>
              )}
            </div>

            {/* Music / Sound name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                <Music2 className="w-4 h-4 text-pink-400" />
                Sound name <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={music}
                onChange={(e) => setMusic(e.target.value)}
                placeholder="e.g. Blinding Lights - The Weeknd"
                className="w-full bg-transparent text-white border-b border-gray-800 focus:border-white outline-none py-2 placeholder-gray-600 transition text-sm"
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

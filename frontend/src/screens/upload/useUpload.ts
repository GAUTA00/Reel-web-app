// src/screens/upload/useUpload.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/axiosInstance';
import type { Reel } from '../../types/reel.types';

export const useUpload = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      axiosInstance.post<Reel>('/reels/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            const pct = Math.round((event.loaded * 100) / event.total);
            setProgress(pct);
          }
        },
      }).then((res) => res.data),

    onSuccess: () => {
      setProgress(null);
      toast.success('Reel uploaded!');
      navigate('/feed');
    },
    onError: (err: Error) => {
      setProgress(null);
      toast.error(err.message || 'Upload failed. Please try again.');
    },
  });

  return { ...mutation, progress };
};

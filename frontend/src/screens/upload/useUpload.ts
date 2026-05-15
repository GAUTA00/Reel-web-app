// src/screens/upload/useUpload.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { uploadReel } from '../../services/reelService';

export const useUpload = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (formData: FormData) => uploadReel(formData),
    onSuccess: () => {
      toast.success('Reel uploaded!');
      navigate('/feed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Upload failed. Please try again.');
    },
  });
};

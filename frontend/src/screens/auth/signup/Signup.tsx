// src/screens/auth/signup/Signup.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { signupSchema, type SignupSchema } from '../../../schemas/signupSchema';
import { useSignup } from './useSignup';

export default function Signup() {
  const navigate = useNavigate();
  const { mutate: signup, isPending } = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: yupResolver(signupSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: SignupSchema) => {
    signup(data);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">

      {/* Header */}
      <div className="mb-12 text-center animate-fade-in">
        <h2 className="font-serif text-4xl mb-4 tracking-tight">Join Reelify</h2>
        <p className="text-gray-500 text-sm tracking-wide">START YOUR JOURNEY</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm flex flex-col gap-6 animate-slideUp">

        {/* Name */}
        <div className="flex flex-col gap-1">
          <input
            {...register('name')}
            type="text"
            placeholder="FULL NAME"
            className="w-full bg-transparent border-b border-gray-800 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors text-sm tracking-wide"
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <input
            {...register('email')}
            type="email"
            placeholder="EMAIL ADDRESS"
            className="w-full bg-transparent border-b border-gray-800 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors text-sm tracking-wide"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <input
            {...register('password')}
            type="password"
            placeholder="PASSWORD"
            className="w-full bg-transparent border-b border-gray-800 py-3 text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors text-sm tracking-wide"
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Primary Action */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-4 w-full bg-white text-black font-bold text-xs py-4 tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isPending ? 'CREATING...' : 'SIGN UP'}
        </button>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-gray-500 text-xs tracking-wide hover:text-white transition-colors border-b border-transparent hover:border-gray-500 pb-0.5"
          >
            ALREADY HAVE AN ACCOUNT?
          </button>
        </div>
      </form>

      <ToastContainer position="bottom-center" toastStyle={{ backgroundColor: '#111', color: '#fff' }} />
    </div>
  );
}

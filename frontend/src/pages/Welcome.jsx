import { useNavigate } from 'react-router-dom';

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between items-center p-6 relative overflow-hidden font-serif">

            {/* Top Nav (Placeholder for now) */}
            <div className="w-full flex justify-between items-center opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {/* Could put simplified logo here */}
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center flex-1 text-center z-10 w-full max-w-2xl">
                <div className="mb-12 animate-fade-in relative">
                    <h1 className="text-7xl md:text-9xl font-thin tracking-tighter mix-blend-difference z-10">
                        reelify
                    </h1>
                    {/* Subtle accent line */}
                    <div className="h-[2px] w-24 bg-pink-600 mx-auto mt-6" />
                </div>

                <p className="text-lg md:text-xl text-gray-400 font-sans font-light tracking-wide mb-16 max-w-md animate-slideUp leading-relaxed">
                    Share your world in seconds. <br /> The new standard for short-form video.
                </p>

                <div className="flex flex-col md:flex-row gap-6 w-full max-w-sm animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 border border-white bg-white text-black font-sans font-bold tracking-widest text-sm hover:scale-105 transition-transform duration-300"
                    >
                        LOG IN
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="w-full py-4 border border-white text-white font-sans font-bold tracking-widest text-sm hover:bg-white hover:text-black transition-all duration-300"
                    >
                        JOIN
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full flex justify-center py-6 text-[10px] text-gray-600 font-sans tracking-widest uppercase animate-fade-in">
                <span>© 2026 Reelify Inc.</span>
            </div>

            {/* Ambient Background Noise/Grain (Simulated via CSS) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />
        </div>
    );
}
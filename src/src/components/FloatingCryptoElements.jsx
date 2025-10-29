import React, { useState, useEffect, useRef } from 'react';

const FloatingCryptoElements = ({ darkMode = false, numberOfElements = 8 }) => {
    const [tokens, setTokens] = useState([]);
    const [particles, setParticles] = useState([]);
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);

    // Crypto token data with colors and icon URLs
    const tokenData = [
        { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', gradient: 'from-orange-400 to-orange-600', iconUrl: './src/assets/btc.svg' },
        { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', gradient: 'from-blue-400 to-blue-600', iconUrl: './src/assets/eth.svg' },
        { symbol: 'BNB', name: 'Binance Coin', color: '#F3BA2F', gradient: 'from-yellow-400 to-yellow-600', iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
        { symbol: 'SOL', name: 'Solana', color: '#14F195', gradient: 'from-green-400 to-green-600', iconUrl: './src/assets/sol.svg' },
        { symbol: 'ADA', name: 'Cardano', color: '#0033FF', gradient: 'from-indigo-400 to-indigo-600', iconUrl: './src/assets/ada.svg' },
        { symbol: 'DOGE', name: 'Dogecoin', color: '#BA9F33', gradient: 'from-amber-400 to-amber-600', iconUrl: './src/assets/dogecoin.svg' },
        { symbol: 'SHIB', name: 'Shiba Inu', color: '#FF6B35', gradient: 'from-red-400 to-red-600', iconUrl: './src/assets/shib.svg' },
        { symbol: 'DOT', name: 'Polkadot', color: '#E6007A', gradient: 'from-pink-400 to-pink-600', iconUrl: './src/assets/dot.svg' },
    ];

    const container = useRef(null);

    useEffect(() => {
        // Initialize particles with random positions and velocities
        const newParticles = Array.from({ length: numberOfElements }, (_, i) => ({
            id: i,
            x: Math.random() * (container.current?.clientWidth || 800),
            y: Math.random() * (container.current?.clientHeight || 600),
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            token: tokenData[i % tokenData.length],
            radius: 35,
        }));

        particlesRef.current = newParticles;
        setParticles(newParticles);
    }, [numberOfElements]);

    useEffect(() => {
        const container_el = container.current;
        if (!container_el) return;

        const width = container_el.clientWidth;
        const height = container_el.clientHeight;

        let animationId;

        const animate = () => {
            const particles = particlesRef.current;

            // Update positions
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x - p.radius < 0 || p.x + p.radius > width) {
                    p.vx *= -1;
                    p.x = Math.max(p.radius, Math.min(width - p.radius, p.x));
                }
                if (p.y - p.radius < 0 || p.y + p.radius > height) {
                    p.vy *= -1;
                    p.y = Math.max(p.radius, Math.min(height - p.radius, p.y));
                }
            });

            // Collision detection and response
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - particles[i].x;
                    const dy = particles[j].y - particles[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = particles[i].radius + particles[j].radius;

                    if (distance < minDistance) {
                        // Collision detected
                        const angle = Math.atan2(dy, dx);
                        const sin = Math.sin(angle);
                        const cos = Math.cos(angle);

                        // Rotate velocities
                        const vx1 = particles[i].vx * cos + particles[i].vy * sin;
                        const vy1 = particles[i].vy * cos - particles[i].vx * sin;
                        const vx2 = particles[j].vx * cos + particles[j].vy * sin;
                        const vy2 = particles[j].vy * cos - particles[j].vx * sin;

                        // Swap velocities (elastic collision with equal mass)
                        particles[i].vx = vx2 * cos - vy1 * sin;
                        particles[i].vy = vy1 * cos + vx2 * sin;
                        particles[j].vx = vx1 * cos - vy2 * sin;
                        particles[j].vy = vy2 * cos + vx1 * sin;

                        // Separate particles
                        const overlap = minDistance - distance;
                        const moveX = (overlap / 2) * cos;
                        const moveY = (overlap / 2) * sin;

                        particles[i].x -= moveX;
                        particles[i].y -= moveY;
                        particles[j].x += moveX;
                        particles[j].y += moveY;
                    }
                }
            }

            setParticles([...particles]);
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div
            ref={container}
            className={`relative w-full h-screen overflow-hidden ${
                darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 to-slate-100'
            }`}
        >
            {/* Animated background grid */}
            {/* <div className={`absolute inset-0 opacity-10 ${darkMode ? 'bg-grid-dark' : 'bg-grid'}`}
                style={{
                    backgroundImage: darkMode 
                        ? 'linear-gradient(to right, rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.1) 1px, transparent 1px)'
                        : 'linear-gradient(to right, rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            /> */}

            {/* Floating particles */}
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className={`absolute transition-none`}
                    style={{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div
                        className={`w-[40px] h-[40px] rounded-full bg-gradient-to-br ${particle.token.gradient} shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer group overflow-hidden`}
                        style={{
                            boxShadow: `0 0 30px ${particle.token.color}40, 0 0 60px ${particle.token.color}20`,
                        }}
                    >
                        <img 
                            src={particle.token.iconUrl}
                            alt={particle.token.symbol}
                            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="text-white font-bold text-lg hidden group-hover:scale-110 transition-transform duration-300">
                            {particle.token.symbol}
                        </div>
                    </div>
                </div>
            ))}

            {/* Glow effect overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
            </div>
        </div>
    );
};

export default FloatingCryptoElements;
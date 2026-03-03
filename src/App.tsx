import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Pusher from 'pusher-js';
import emailjs from '@emailjs/browser';
import { wordpressService, WPPost } from './services/wordpressService';
import {
  Radio,
  Eye,
  Shirt,
  Ticket,
  Activity,
  Volume2,
  Maximize2,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Power,
  Instagram,
  Mail,
  MessageSquare,
  Send,
  Calendar,
  Briefcase
} from 'lucide-react';

// --- Pusher Setup ---
let pusherClient: Pusher | null = null;
if (import.meta.env.VITE_PUSHER_KEY && import.meta.env.VITE_PUSHER_CLUSTER) {
  pusherClient = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  });
}

// --- Constants ---
const PROFILE_PHOTO = "/favicon.jpg";

// --- Types ---
type Channel = 'LATEST' | 'SOUND' | 'VISION' | 'THREADS' | 'BOXOFFICE' | 'INTEL' | 'CHAT' | 'BOOKING';

interface FeedItem {
  id: string;
  type: 'YOUTUBE' | 'INSTAGRAM';
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

// --- Components ---

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);

  useEffect(() => {
    let timeoutId: number;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');

      setTrail(prev => [
        ...prev.slice(-10),
        { x: e.clientX, y: e.clientY, id: Date.now() }
      ]);

      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setTrail([]), 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <div
        className="custom-cursor"
        style={{
          left: position.x,
          top: position.y,
          width: isPointer ? '40px' : '24px',
          height: isPointer ? '40px' : '24px',
          borderColor: isPointer ? '#FF0000' : '#00FF41'
        }}
      />
      {trail.map((t, i) => (
        <div
          key={t.id}
          className="cursor-trail"
          style={{
            left: t.x,
            top: t.y,
            opacity: (i / trail.length) * 0.5,
            transform: `scale(${i / trail.length})`
          }}
        />
      ))}
    </>
  );
};

const SignalHUD = () => {
  const [strength, setStrength] = useState(100);
  const [lastMove, setLastMove] = useState(Date.now());

  useEffect(() => {
    const handleMove = () => setLastMove(Date.now());
    window.addEventListener('mousemove', handleMove);

    const interval = setInterval(() => {
      const idleTime = Date.now() - lastMove;
      if (idleTime > 2000) {
        setStrength(prev => Math.max(40, prev - (Math.random() * 5)));
      } else {
        setStrength(prev => Math.min(100, prev + (Math.random() * 10)));
      }
    }, 500);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      clearInterval(interval);
    };
  }, [lastMove]);

  return (
    <div className="fixed top-6 left-6 z-50 flex flex-col gap-1 pointer-events-none">
      <div className="flex items-center gap-2">
        <div className="text-[10px] font-bold tracking-widest text-signal-green uppercase">Signal Strength</div>
        <div className="text-[10px] font-mono text-white/40">{Math.round(strength)}%</div>
      </div>
      <div className="w-32 h-1 bg-white/5 border border-white/10 overflow-hidden">
        <motion.div
          animate={{
            width: `${strength}%`,
            backgroundColor: strength < 60 ? '#FF0000' : '#00FF41'
          }}
          className="h-full"
        />
      </div>
      <div className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">
        {strength < 60 ? 'WARNING: SIGNAL DEGRADATION' : 'ENCRYPTED_LINK_STABLE'}
      </div>
    </div>
  );
};

const DecryptedText = ({ text, className = "" }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = useState("");
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split("").map((char, index) => {
        if (index < iteration) return text[index];
        if (char === " " || char === "\n") return char;
        return characters[Math.floor(Math.random() * characters.length)];
      }).join(""));

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
};

const CRTOverlay = () => (
  <div className="crt-overlay crt-flicker pointer-events-none" />
);

const OnAirSign = ({ active }: { active: boolean }) => (
  <div className="fixed top-2 right-2 md:top-6 md:right-6 z-50 flex flex-col items-end gap-1 md:gap-4">
    <div className="flex items-center gap-2">
      <motion.div
        animate={{
          opacity: active ? [1, 0.4, 1] : 0.2,
          scale: active ? [1, 1.05, 1] : 1
        }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className={`px-1.5 py-0.5 md:px-3 md:py-1 border-2 font-bold text-[8px] md:text-xs tracking-widest ${active ? 'border-broadcast-red text-broadcast-red bg-broadcast-red/10' : 'border-white/20 text-white/20'
          }`}
      >
        ON AIR
      </motion.div>
    </div>

    {active && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1 md:gap-2 items-end"
      >
        <a
          href="https://instagram.com/chazzy.boo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-1.5 py-1 md:px-3 md:py-2 bg-white/5 border border-white/10 hover:bg-signal-green hover:text-onyx transition-all text-[8px] md:text-[10px] font-bold tracking-widest"
        >
          <Instagram size={10} className="md:w-3.5 md:h-3.5" />
          @CHAZZY.BOO
        </a>
        <a
          href="mailto:chazzyboo.inquiries@gmail.com"
          className="flex items-center gap-1.5 px-1.5 py-1 md:px-3 md:py-2 bg-white/5 border border-white/10 hover:bg-signal-green hover:text-onyx transition-all text-[8px] md:text-[10px] font-bold tracking-widest"
        >
          <Mail size={10} className="md:w-3.5 md:h-3.5" />
          CONTACT HUB
        </a>
      </motion.div>
    )}
  </div>
);

const StartScreen = ({ onStart }: { onStart: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + Math.random() * 15 : 100));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (progress < 100) return;
    setIsExiting(true);
    setTimeout(onStart, 1000);
  };

  return (
    <div className={`w-full h-full bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden relative ${isExiting ? 'tunnel-zoom' : ''}`}>
      {/* Intense Static Layers */}
      <div className="absolute inset-0 z-0">
        <div className="intense-static" />
        <div className="rgb-static-container opacity-30">
          <div className="rgb-layer rgb-layer-r" />
          <div className="rgb-layer rgb-layer-g" />
          <div className="rgb-layer rgb-layer-b" />
        </div>
        <div className="static-flash" />
        <div className="glitch-scanline" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black/60" />
      </div>

      {/* Abstract Artistic Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 border-r border-b border-white/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="mb-12">
          <motion.div
            initial={{ letterSpacing: '0.1em' }}
            animate={{ letterSpacing: '0.8em' }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="text-signal-green text-[10px] md:text-xs uppercase font-bold mb-4"
          >
            Establishing Connection
          </motion.div>

          <h1 className="text-[10vw] md:text-[8vw] font-black tracking-tighter italic leading-none chromatic-aberration mb-4">
            CHAZZY BOO<br />
            <span className="text-white">TV</span>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Progress Bar */}
          <div className="w-64 h-1 bg-white/10 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-signal-green"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={progress < 100}
              className={`brutalist-btn ${progress < 100 ? 'opacity-20 cursor-not-allowed' : 'opacity-100'}`}
            >
              <div className="flex items-center gap-4">
                <Power size={20} className={progress >= 100 ? 'text-broadcast-red' : 'text-white/20'} />
                {progress < 100 ? 'SYNCING...' : 'TUNE IN'}
              </div>
            </motion.button>

            <div className="text-[9px] text-white/40 font-mono tracking-widest uppercase flex gap-4">
              <span>Signal: {Math.round(progress)}%</span>
              <span className="text-white/10">|</span>
              <span>Node: 092-CHAZZYBOOTV</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vertical Rail Text */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <div className="writing-mode-vertical text-[8px] text-white/20 tracking-[1em] uppercase">
          Broadcast Noir // Creative Frequency
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col md:flex-row gap-4 md:gap-12 text-[8px] text-white/10 font-mono tracking-widest uppercase z-10 text-center">
        <span>©2026 CHAZZYBOOTV BROADCASTING</span>
        <span className="hidden md:inline text-white/5">|</span>
        <span>ALL RIGHTS RESERVED</span>
      </div>
    </div>
  );
};

const CornerBug = () => (
  <div className="fixed bottom-24 md:bottom-12 right-4 md:right-6 z-50 opacity-40 pointer-events-none">
    <div className="text-right">
      <div className="text-[8px] md:text-xs font-bold tracking-tighter">CHAZZYBOOTV</div>
      <div className="text-[6px] md:text-[10px] tracking-widest text-signal-green uppercase">Signal 092</div>
    </div>
  </div>
);

const GlitchIntro = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Color Bars */}
      <div className="absolute inset-0 flex">
        {['#FFFFFF', '#FFFF00', '#00FFFF', '#00FF00', '#FF00FF', '#FF0000', '#0000FF'].map((color, i) => (
          <div key={i} className="flex-1 h-full" style={{ backgroundColor: color }} />
        ))}
      </div>

      {/* Static Glitch Overlay */}
      <motion.div
        animate={{
          x: [-10, 10, -5, 5, 0],
          opacity: [0.8, 0.4, 0.9, 0.5, 0.8]
        }}
        transition={{ repeat: Infinity, duration: 0.1 }}
        className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uWUznW3D2/giphy.gif')] bg-cover opacity-20 mix-blend-overlay"
      />

      <div className="relative z-10 bg-black px-8 py-4 border-4 border-white">
        <h1 className="text-4xl font-bold tracking-tighter italic">CHAZZYBOOTV</h1>
        <div className="text-center text-xs mt-2 tracking-[0.5em] text-signal-green">ESTABLISHING CONNECTION...</div>
      </div>
    </div>
  );
};

const RemoteControl = ({ currentChannel, setChannel }: { currentChannel: Channel, setChannel: (c: Channel) => void }) => {
  const channels: { id: Channel; icon: any; label: string; num: string }[] = [
    { id: 'LATEST', icon: Activity, label: 'LATEST', num: '00' },
    { id: 'SOUND', icon: Radio, label: 'SOUND', num: '01' },
    { id: 'VISION', icon: Eye, label: 'VISION', num: '02' },
    { id: 'THREADS', icon: Shirt, label: 'THREADS', num: '03' },
    { id: 'BOXOFFICE', icon: Ticket, label: 'ACCESS', num: '04' },
    { id: 'INTEL', icon: Maximize2, label: 'INTEL', num: '05' },
    { id: 'CHAT', icon: MessageSquare, label: 'CHAT', num: '06' },
    { id: 'BOOKING', icon: Calendar, label: 'BOOKING', num: '07' },
  ];

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 md:left-8 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 z-50 flex flex-col gap-4 w-[96vw] md:w-auto">
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-0.5 md:p-4 rounded-lg md:rounded-2xl flex flex-row md:flex-col gap-0.5 md:gap-6 items-center">
        <div className="hidden md:flex justify-center">
          <div className="w-8 h-8 rounded-full bg-broadcast-red/20 flex items-center justify-center border border-broadcast-red/40">
            <Power size={14} className="text-broadcast-red" />
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-0.5 md:gap-2 flex-1 w-full">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setChannel(ch.id)}
              className={`flex-1 md:flex-none group relative flex items-center justify-center h-8 md:w-12 md:h-12 rounded-md md:rounded-xl transition-all duration-300 ${currentChannel === ch.id
                ? 'bg-signal-green text-onyx shadow-[0_0_15px_rgba(0,255,65,0.5)]'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
            >
              <ch.icon size={12} className="md:w-5 md:h-5" />
              <div className="hidden md:block absolute left-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <span className="text-[10px] text-signal-green mr-2">{ch.num}</span>
                <span className="text-xs font-bold tracking-widest">{ch.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="hidden md:flex flex-col gap-2 pt-4 border-t border-white/10">
          <button className="w-12 h-8 bg-white/5 rounded-md flex items-center justify-center text-white/40 hover:text-white">
            <ChevronRight size={16} />
          </button>
          <button className="w-12 h-8 bg-white/5 rounded-md flex items-center justify-center text-white/40 hover:text-white">
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Channel Views ---

const ChannelSound = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const togglePlay = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ command: 'toggle' }, '*');
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 md:p-20 overflow-y-auto">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center py-16 md:py-0">
        <div className="relative aspect-square bg-white/5 border border-white/10 overflow-hidden group max-w-[280px] md:max-w-sm mx-auto w-full">
          <img
            src={PROFILE_PHOTO}
            alt="Chazzy Boo Profile"
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-signal-green text-onyx flex items-center justify-center shadow-2xl"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
            </motion.button>
          </div>

          {/* Equalizer Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 flex items-end gap-0.5 md:gap-1 px-2 md:px-4 pb-2 md:pb-4 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: isPlaying ? [5, Math.random() * 60 + 5, 5] : 2 }}
                transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5 }}
                className="flex-1 bg-signal-green/40"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div>
            <div className="text-signal-green text-[10px] md:text-xs tracking-[0.3em] mb-2 uppercase">Now Broadcasting</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 italic">FREQUENCY 01</h2>
            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-md">
              A sonic exploration of midnight frequencies. Blending industrial textures with deep atmospheric resonance.
            </p>
          </div>

          <div className="w-full h-[352px] rounded-xl overflow-hidden shadow-2xl">
            <iframe
              ref={iframeRef}
              src="https://open.spotify.com/embed/artist/0bFrhCc82qmydNx8NCRY9e?utm_source=generator&theme=0"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"
              className="bg-black mix-blend-screen"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChannelVision = () => {
  const [selectedFeed, setSelectedFeed] = useState<any>(null);
  const [feeds, setFeeds] = useState<any[]>([]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch('/api/portfolio-feed');
        const data = await res.json();
        setFeeds(data);
      } catch (e) {
        console.error("Failed to fetch portfolio feed", e);
      }
    };
    fetchPortfolio();
  }, []);

  return (
    <div className="h-full p-4 md:p-24 overflow-y-auto bg-[#1a1a1a] flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 noise-bg opacity-20 pointer-events-none" />

      <div className="text-center z-10 space-y-6">
        <div className="text-signal-green text-xs tracking-[0.5em] mb-4 uppercase animate-pulse">
          Node Offline // Awaiting Transmission
        </div>

        <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic chromatic-aberration text-white opacity-80">
          COMING SOON
        </h2>

        <div className="w-full h-[1px] bg-white/10 my-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/4 bg-signal-green/50 animate-[scanLines_2s_linear_infinite]" />
        </div>

        <p className="text-white/40 font-mono text-xs max-w-md mx-auto leading-relaxed">
          The visual archive is currently undergoing decryption.
          New portfolio signals will broadcast on this channel shortly.
          Stand by.
        </p>
      </div>

      <div className="absolute bottom-8 left-8 text-[10px] text-white/20 font-mono">
        SYS.ERR: PORTFOLIO_FEED_REDIRECT
      </div>
    </div>
  );
};

const ChannelThreads = () => {
  return (
    <div className="h-full flex items-center justify-center p-0 pb-32 md:pb-0">
      <div className="w-full max-w-6xl flex gap-4 md:gap-8 h-full md:h-[80vh] overflow-hidden pt-16 md:pt-0">
        {/* Infinite Scrolling Film Strips */}
        {[1, 2, 3].map((col) => (
          <div key={col} className={`flex-1 relative ${col > 1 ? 'hidden md:block' : ''}`}>
            <motion.div
              animate={{ y: col % 2 === 0 ? [0, -1000] : [-1000, 0] }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="flex flex-col gap-4"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="relative aspect-[3/4] bg-white/5 border-x-4 md:border-x-8 border-onyx overflow-hidden group">
                  {/* Film Sprockets */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 md:w-2 flex flex-col justify-around py-2 z-10">
                    {Array.from({ length: 8 }).map((_, j) => <div key={j} className="w-0.5 md:w-1 h-1 md:h-2 bg-onyx rounded-sm" />)}
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 md:w-2 flex flex-col justify-around py-2 z-10">
                    {Array.from({ length: 8 }).map((_, j) => <div key={j} className="w-0.5 md:w-1 h-1 md:h-2 bg-onyx rounded-sm" />)}
                  </div>

                  <img
                    src={`https://picsum.photos/seed/threads-${col}-${i}/600/800`}
                    alt="Fashion"
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />

                  {/* Loupe Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
                    <div className="absolute inset-0 bg-signal-green/10 mix-blend-overlay" />
                    <div className="absolute top-4 left-4 text-[8px] font-mono text-signal-green bg-black/60 px-1 py-0.5 uppercase">
                      Magnify_Node_{col}_{i}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        ))}

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
          <div className="bg-onyx/80 backdrop-blur-sm border border-white/10 p-8 md:p-12 max-w-md text-center">
            <div className="text-signal-green text-[10px] md:text-xs tracking-[0.5em] mb-4 uppercase">Lookbook Loops</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter italic mb-6">THREADS</h2>
            <p className="text-xs md:text-sm text-white/60 leading-relaxed">
              Visual narratives through textile and form. A collaboration of aesthetic frequencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span>
      {String(timeLeft.days).padStart(2, '0')}:
      {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </span>
  );
};

const BoxOffice = () => {
  const events = [
    { id: 1, title: 'VIBE SERIES', date: 'MAR 19', time: '19:00', status: 'PHYSICAL EVENT', price: 'TICKETS', url: 'https://www.eventbrite.ca/e/vibe-series-tickets-1982595902715?aff=ebdssbdestsearch' },
    { id: 2, title: 'TRANSMISSION 02', date: 'TBA', time: '--:--', status: 'LIVE BROADCAST', price: '-' },
    { id: 3, title: 'TRANSMISSION 03', date: 'TBA', time: '--:--', status: 'PRIVATE FEED', price: '-' },
  ];

  return (
    <div className="h-full p-4 md:p-24 flex flex-col overflow-y-auto pt-24 md:pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 md:mb-16">
        <div>
          <div className="text-broadcast-red text-[10px] md:text-xs tracking-[0.3em] mb-2 uppercase">Scheduled Broadcasts</div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter italic">BOX OFFICE</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <a
            href="https://www.eventbrite.ca/e/vibe-series-tickets-1982595902715?aff=ebdssbdestsearch"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-6 py-3 bg-onyx border border-white/20 hover:border-signal-green hover:text-signal-green transition-all text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"
          >
            <Ticket size={14} />
            VIEW ON EVENTBRITE
          </a>
          <div className="w-full md:w-auto bg-broadcast-red/10 border border-broadcast-red p-4 md:p-6 text-center">
            <div className="text-[8px] md:text-[10px] text-broadcast-red tracking-widest mb-1 uppercase">Next Transmission</div>
            <div className="text-2xl md:text-4xl font-bold font-mono text-broadcast-red">
              <Countdown targetDate="2026-03-19T19:00:00" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 md:space-y-4 pb-32 md:pb-0">
        {events.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ x: 5 }}
            className={`group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-4 md:p-8 border border-white/10 bg-white/5 transition-all duration-300 ${event.url ? 'hover:bg-signal-green hover:text-onyx cursor-pointer' : 'opacity-80 grayscale cursor-default'}`}
          >
            <div className="text-xl md:text-2xl font-bold font-mono md:w-24">{event.date}</div>
            <div className="flex-1">
              <div className="text-[8px] md:text-[10px] tracking-widest opacity-60 group-hover:opacity-100 mb-1 uppercase">{event.status}</div>
              <div className="text-xl md:text-3xl font-bold tracking-tighter italic">{event.title}</div>
            </div>
            <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
              <div className="text-xs md:text-sm font-bold">{event.time} {event.date !== 'TBA' && 'PST'}</div>
              {event.url ? (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 md:px-6 py-1.5 md:py-2 border-2 border-current font-bold text-[10px] md:text-xs tracking-widest hover:bg-onyx hover:text-white transition-colors inline-block text-center"
                >
                  GET TICKETS
                </a>
              ) : (
                <button disabled className="px-4 md:px-6 py-1.5 md:py-2 border-2 border-current font-bold text-[10px] md:text-xs tracking-widest opacity-50 cursor-not-allowed">
                  STAND BY
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ChannelLatest = ({ feed }: { feed: FeedItem[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const displayFeed = feed.slice(0, 12);
  const latest = displayFeed[currentIndex];

  useEffect(() => {
    if (isManual || displayFeed.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayFeed.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isManual, displayFeed.length]);

  if (!latest) return <div className="h-full flex items-center justify-center text-white/20">NO SIGNAL DETECTED</div>;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 md:p-20 overflow-y-auto w-full">
      <div className="w-full max-w-5xl pt-24 md:pt-0 pb-32 md:pb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-broadcast-red animate-pulse" />
          <div className="text-broadcast-red text-[10px] md:text-xs tracking-[0.4em] md:tracking-[0.5em] font-bold uppercase">Breaking Transmission</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
          <div className="lg:col-span-2 relative aspect-[16/9] bg-white/5 border border-white/10 overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img
                key={latest.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.8, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                src={latest.thumbnail}
                alt={latest.title}
                className="w-full h-full object-cover group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-onyx via-transparent to-transparent opacity-60" />
            <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-black/80 px-2 py-0.5 md:px-3 md:py-1 border border-white/20 text-[8px] md:text-[10px] font-bold tracking-widest uppercase">
              {latest.type} // {new Date(latest.publishedAt).toLocaleDateString()}
            </div>
            <a
              href={latest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-onyx/40 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 border-2 border-signal-green text-signal-green font-bold tracking-[0.15em] md:tracking-[0.2em] text-xs md:text-base">
                <Play size={18} fill="currentColor" />
                TUNE IN NOW
              </div>
            </a>
          </div>

          <div className="space-y-6 md:space-y-8 h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={latest.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl md:text-4xl font-bold tracking-tighter italic mb-4 leading-tight">{latest.title}</h2>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed">
                  Detected a new frequency from {latest.type}. Signal strength: OPTIMAL.
                  Broadcast initiated at {new Date(latest.publishedAt).toLocaleTimeString()}.
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-3 md:space-y-4 pt-4 md:pt-6 border-t border-white/10 flex-1 flex flex-col min-h-0">
              <div className="text-[9px] md:text-[10px] text-signal-green tracking-widest uppercase flex justify-between items-center shrink-0">
                <span>Recent Signals</span>
                {!isManual && <span className="text-[8px] text-white/20 animate-pulse">AUTO_CYCLE_ACTIVE</span>}
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 md:space-y-4 max-h-[350px]">
                {displayFeed.map((item, idx) => (
                  <button
                    key={item.id + idx.toString()}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsManual(true);
                    }}
                    className={`w-full flex items-center gap-3 md:gap-4 group cursor-pointer text-left transition-all ${currentIndex === idx ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                  >
                    <div className={`w-12 md:w-16 aspect-video shrink-0 bg-white/10 overflow-hidden border ${currentIndex === idx ? 'border-signal-green' : 'border-white/10'}`}>
                      <img src={item.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[8px] md:text-[9px] uppercase tracking-widest">{item.type}</div>
                      <div className={`text-[10px] md:text-xs font-bold truncate ${currentIndex === idx ? 'text-signal-green' : 'group-hover:text-signal-green'} transition-colors`}>{item.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChannelIntel = () => {
  const signals = [
    { platform: 'APPLE_MUSIC', url: 'https://music.apple.com/us/artist/chazzy-boo/1462602436', desc: 'Premium sound frequency distribution.', category: 'SOUND' },
    { platform: 'YOUTUBE_MUSIC', url: 'https://music.youtube.com/channel/UCuPj0ueiklKL46TFjKWuD-Q', desc: 'Google Play / YouTube Music node.', category: 'SOUND' },
    { platform: 'SOUNDCLOUD', url: 'https://soundcloud.com/chazzyboo780', desc: 'Sound archives and experimental frequencies.', category: 'SOUND' },
    { platform: 'INSTAGRAM', url: 'https://www.instagram.com/chazzy.boo/', desc: 'Visual transmission and daily logs.', category: 'VISION' },
    { platform: 'YOUTUBE', url: 'https://youtube.com/@chazzybootv', desc: 'Broadcast hub for high-definition visuals.', category: 'VISION' },
    { platform: 'EVENTBRITE', url: 'https://www.eventbrite.ca/e/vibe-series-tickets-1982595902715?aff=ebdssbdestsearch#organizer-card', desc: 'Primary ticketing node for physical events.', category: 'ACCESS' },
    { platform: 'SPOTIFY', url: 'https://open.spotify.com/artist/0bFrhCc82qmydNx8NCRY9e', desc: 'Verified sound frequency distribution.', category: 'SOUND' },
    { platform: 'X', url: 'https://x.com/ChazzyBoo780', desc: 'Real-time broadcast updates and signal logs.', category: 'INTEL' },
  ];

  const wpConnected = !!import.meta.env.VITE_WP_API_URL;

  const googleBio = {
    description: "Chazzy Boo is a multi-disciplinary artist and producer known for blending high-fashion aesthetics with industrial sonic textures.",
    aiBio: "Chazzy Boo is a multi-hyphenate creative force based in Western Canada, operating as a Musically Inclined Artist, Producer, DJ, Photographer, & Visual Artist. Operating at the bleeding edge of digital media, Chazzy Boo has carved out a unique space in the contemporary art scene. Known for a distinct 'Broadcast Noir' aesthetic, their work spans high-fashion photography, industrial-leaning electronic music production, and immersive digital experiences that challenge the boundaries of traditional media.\n\nWith a growing footprint in major creative hubs like Vancouver, Victoria, and Edmonton, Chazzy Boo has established a reputation for blending gritty urban textures with high-end visual narratives. Their digital presence, curated under the CBTV (Chazzy Boo TV) banner, serves as a living archive of their multidisciplinary output. This unique creative philosophy treats digital portfolios as immersive media channels, characterized by a signature midnight-onyx palette and a relentless focus on signal-heavy, atmospheric storytelling. Whether through the lens of a camera or the frequencies of a synthesizer, Chazzy Boo invites the audience into a curated world where every signal is intentional and every frame is a narrative. Their work is not just seen or heard; it is experienced as a continuous broadcast of creative evolution."
  };

  return (
    <div className="h-full p-4 md:p-24 overflow-y-auto pt-16 md:pt-24">
      <div className="mb-12 max-w-4xl mx-auto md:mx-0">
        <div className="text-signal-green text-[10px] md:text-xs tracking-[0.3em] mb-2 uppercase">Intercepted Data</div>
        <h2 className="text-2xl md:text-5xl font-bold tracking-tighter italic">INTEL LOGS</h2>

        <div className="mt-6 md:mt-8 p-4 md:p-6 border border-white/10 bg-white/5 space-y-6">
          <div>
            <div className="text-[10px] text-signal-green font-bold tracking-widest uppercase mb-2">Identity Profile</div>
            <p className="text-sm text-white/80 italic">"<DecryptedText text={googleBio.description} />"</p>
          </div>
          <div>
            <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
              <DecryptedText text={googleBio.aiBio} />
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-32 md:pb-0 max-w-4xl mx-auto md:mx-0">
        {signals.map((sig, i) => (
          <motion.a
            key={sig.platform}
            href={sig.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 border border-white/10 bg-white/5 hover:border-signal-green transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-[10px] text-signal-green font-bold tracking-widest uppercase">{sig.platform}</div>
              <div className="text-[8px] text-white/20 font-mono">NODE 0{i + 1}</div>
            </div>
            <div className="text-xl font-bold tracking-tight mb-2 group-hover:text-signal-green transition-colors">
              {sig.platform} SIGNAL
            </div>
            <p className="text-xs text-white/60 mb-4">{sig.desc}</p>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/40 group-hover:text-white transition-colors">
              CONNECTING... <ChevronRight size={12} />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

const ChannelChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [username] = useState(`SIGNAL ${Math.floor(Math.random() * 999)}`);

  useEffect(() => {
    if (!pusherClient) return;

    const channel = pusherClient.subscribe('chat-room');
    channel.bind('message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-49), msg]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input;
    setInput("");

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, text }),
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-24 pt-24 md:pt-24 pb-32 md:pb-24">
      <div className="mb-8 max-w-2xl mx-auto md:mx-0 w-full">
        <div className="text-signal-green text-[10px] md:text-xs tracking-[0.3em] mb-2 uppercase">Live Frequency</div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter italic">CHAT STREAM</h2>
      </div>

      <div className="flex-1 flex flex-col bg-white/5 border border-white/10 overflow-hidden max-w-2xl w-full mx-auto md:mx-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin scrollbar-thumb-signal-green scrollbar-track-onyx">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-signal-green font-bold">[{msg.user}]</span>
                <span className="text-white/20 text-[8px]">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-white/80 pl-4 border-l border-white/10 break-words">{msg.text}</div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-white/20 italic">
              WAITING FOR SIGNAL...
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ENTER MESSAGE..."
            className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-xs focus:outline-none focus:border-signal-green transition-colors text-white"
          />
          <button type="submit" className="bg-signal-green text-onyx px-4 py-2 hover:bg-white transition-colors">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

const ChannelBooking = () => {
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');
  const [selectedService, setSelectedService] = useState('photo');

  const services = [
    { id: 'photo', label: 'PHOTOGRAPHY', icon: Eye },
    { id: 'video', label: 'VIDEOGRAPHY', icon: Play },
    { id: 'dj', label: 'DJ SET', icon: Radio },
    { id: 'perf', label: 'PERFORMANCE', icon: Activity },
  ];

  const bookedDates = [
    { date: 'MAR 19', event: 'VIBE SERIES', loc: 'VANCOUVER', url: 'https://www.eventbrite.ca/e/vibe-series-tickets-1982595902715' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'SENDING') return;

    setStatus('SENDING');

    try {
      const serviceName = services.find(s => s.id === selectedService)?.label || selectedService;
      const subject = encodeURIComponent(`Booking Inquiry: ${serviceName} - ${formData.name}`);
      const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nService: ${serviceName}\n\nProject Details:\n${formData.details}`);
      window.location.href = `mailto:chazzyboo.inquiries@gmail.com?subject=${subject}&body=${body}`;

      setStatus('SUCCESS');
      setFormData({ name: '', email: '', details: '' }); // Clear form
      setTimeout(() => setStatus('IDLE'), 3000);
    } catch (error: any) {
      console.error('FAILED...', error);
      setStatus('IDLE');
      alert(`Error submitting form.`);
    }
  };

  return (
    <div className="h-full p-4 md:p-24 overflow-y-auto pt-24 md:pt-24">
      <div className="mb-12 max-w-4xl mx-auto md:mx-0">
        <div className="text-signal-green text-[10px] md:text-xs tracking-[0.3em] mb-2 uppercase">Service Requisition</div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter italic">BOOKING HUB</h2>
        <p className="text-white/40 text-xs md:text-sm mt-4 max-w-xl">
          Initiate a formal request for creative services. Select your required frequency node and provide project parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-32 md:pb-0">
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`p-6 border bg-white/5 flex flex-col items-center gap-4 group transition-all text-left w-full h-full ${selectedService === service.id ? 'border-signal-green text-signal-green shadow-[0_0_15px_rgba(0,255,65,0.2)]' : 'border-white/10 text-white/20 hover:border-signal-green/50 hover:text-signal-green/80'}`}
              >
                <service.icon size={24} className="transition-colors" />
                <div className="text-[10px] font-bold tracking-[0.2em]">{service.label}</div>
              </button>
            ))}
          </div>

          <div className="p-6 border border-signal-green/20 bg-signal-green/5">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase size={18} className="text-signal-green" />
              <div className="text-xs font-bold tracking-widest text-signal-green uppercase">Current Availability</div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Accepting commissions for Q2 2026. Domestic and international travel nodes active.
              Response time: &lt; 24 hours.
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] text-white/40 font-bold tracking-widest uppercase flex items-center gap-2">
              <Calendar size={14} className="text-signal-green" />
              Transmission Schedule [Booked]
            </div>
            <div className="grid grid-cols-1 gap-2">
              {bookedDates.map((item, i) => (
                item.url ? (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 text-[10px] font-mono hover:border-signal-green hover:bg-signal-green/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-signal-green">{item.date}</span>
                      <span className="text-white/80 group-hover:text-white transition-colors">{item.event}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white/40">{item.loc}</span>
                      <div className="flex items-center gap-1 text-signal-green opacity-50 group-hover:opacity-100 transition-opacity">
                        <span>TICKETS</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </a>
                ) : (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 text-[10px] font-mono opacity-50 grayscale">
                    <div className="flex items-center gap-4">
                      <span className="text-signal-green/50">{item.date}</span>
                      <span className="text-white/40">{item.event}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white/20">{item.loc}</span>
                      <span className="text-white/20 tracking-widest">[LOCKED]</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-0 relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 md:p-8 border-b border-white/10 bg-black/40">
            <h3 className="text-xl font-bold tracking-tighter italic flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
              SERVICE CONFIGURATION
            </h3>
            <p className="text-[10px] text-white/40 font-mono mt-2">SELECT PARAMETERS</p>
          </div>

          <div className="flex-1 w-full bg-black/60 p-6 md:p-8 flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-4">
                <label className="text-[10px] text-signal-green tracking-widest uppercase font-bold">Selected Service</label>
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-onyx border border-white/20 p-4 text-xs tracking-widest uppercase appearance-none hover:border-signal-green focus:border-signal-green focus:outline-none transition-colors cursor-pointer"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-signal-green tracking-widest uppercase font-bold">Client Designation</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="NAME / ALIAS"
                  className="w-full bg-onyx border border-white/20 p-4 text-xs tracking-widest uppercase focus:border-signal-green focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-signal-green tracking-widest uppercase font-bold">Comms Link</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-onyx border border-white/20 p-4 text-xs tracking-widest uppercase focus:border-signal-green focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-4 flex-1">
                <label className="text-[10px] text-signal-green tracking-widest uppercase font-bold">Project Details</label>
                <textarea
                  required
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="DESCRIBE THE TRANSMISSION REQUIREMENT..."
                  className="w-full h-full min-h-[120px] bg-onyx border border-white/20 p-4 text-xs tracking-widest uppercase focus:border-signal-green focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status !== 'IDLE'}
                className="w-full p-4 border-2 border-signal-green text-signal-green font-bold tracking-[0.2em] text-xs hover:bg-signal-green hover:text-onyx transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
              >
                {status === 'IDLE' && (
                  <>
                    <span>INITIATE REQUEST</span>
                    <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
                {status === 'SENDING' && <span className="animate-pulse">TRANSMITTING...</span>}
                {status === 'SUCCESS' && <span>THANKS FOR REACHING OUT!</span>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveTicker = () => {
  const headlines = [
    "BREAKING: NEW FREQUENCY DETECTED IN SECTOR 092",
    "CHAZZYBOOTV: SIGNAL STRENGTH OPTIMAL @ 100%",
    "X_INTEL: @ChazzyBoo780 BROADCASTING LIVE FROM THE UNDISCLOSED STUDIO",
    "SOUND_UPDATE: NEW INDUSTRIAL TEXTURES ADDED TO THE ARCHIVE",
    "VISION_LOG: CONTACT SHEET 092-CBTV NOW ACCESSIBLE",
    "SYSTEM_STATUS: ALL NODES OPERATIONAL // BROADCAST NOIR ACTIVE",
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 md:h-8 bg-black border-t border-white/10 z-50 flex items-center overflow-hidden">
      <div className="bg-broadcast-red h-full px-4 flex items-center text-[10px] font-black italic tracking-tighter text-white whitespace-nowrap z-10">
        LIVE INTEL
      </div>
      <div className="flex-1 relative h-full flex items-center">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="flex gap-20 whitespace-nowrap"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-20">
              {headlines.map((text, j) => (
                <div key={j} className="text-[10px] font-mono text-white/40 tracking-widest flex items-center gap-4">
                  <span className="text-signal-green">●</span> {text}
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
      <div className="bg-black h-full px-4 flex items-center text-[10px] font-mono text-white/20 z-10 border-l border-white/10">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [channel, setChannel] = useState<Channel>('LATEST');
  const [isStarted, setIsStarted] = useState(false);
  const [isIntro, setIsIntro] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [activeChannelNum, setActiveChannelNum] = useState("00");
  const [isHumActive, setIsHumActive] = useState(false);
  const [isBreachActive, setIsBreachActive] = useState(false);

  useEffect(() => {
    const breachInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsBreachActive(true);
        setTimeout(() => setIsBreachActive(false), 800);
      }
    }, 10000);
    return () => clearInterval(breachInterval);
  }, []);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [wpPosts, setWpPosts] = useState<WPPost[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch('/api/live-feed');
        const data = await res.json();
        setFeed(data);
      } catch (e) {
        console.error("Failed to fetch live feed", e);
      }
    };

    const fetchWordPressData = async () => {
      const posts = await wordpressService.getLatestPosts();
      setWpPosts(posts);
    };

    fetchFeed();
    fetchWordPressData();
  }, []);

  const handleChannelChange = (newChannel: Channel) => {
    if (newChannel === channel) return;
    setIsChanging(true);

    const channelObj = [
      { id: 'LATEST', num: '00' },
      { id: 'SOUND', num: '01' },
      { id: 'VISION', num: '02' },
      { id: 'THREADS', num: '03' },
      { id: 'BOXOFFICE', num: '04' },
      { id: 'INTEL', num: '05' },
      { id: 'CHAT', num: '06' },
      { id: 'BOOKING', num: '07' },
    ].find(c => c.id === newChannel);

    if (channelObj) setActiveChannelNum(channelObj.num);

    setTimeout(() => {
      setChannel(newChannel);
      setIsChanging(false);
    }, 800);
  };

  return (
    <div className={`relative w-screen h-screen bg-onyx overflow-hidden selection:bg-signal-green selection:text-onyx ${isBreachActive ? 'signal-breach' : ''}`}>
      <CustomCursor />
      <SignalHUD />
      <AnimatePresence mode="wait">
        {!isStarted && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
          >
            <StartScreen onStart={() => setIsStarted(true)} />
          </motion.div>
        )}
        {isStarted && isIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <GlitchIntro onComplete={() => setIsIntro(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStarted && !isIntro && channel !== 'INTEL' && channel !== 'BOOKING' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rgb-static-container"
          >
            <div className="rgb-layer rgb-layer-r" />
            <div className="rgb-layer rgb-layer-g" />
            <div className="rgb-layer rgb-layer-b" />
            <div className="glitch-scanline opacity-20" />
          </motion.div>
        )}
      </AnimatePresence>

      <CRTOverlay />
      <OnAirSign active={isStarted && !isIntro} />
      <CornerBug />
      <LiveTicker />

      {isStarted && !isIntro && (
        <>
          <RemoteControl currentChannel={channel} setChannel={handleChannelChange} />

          <main className="w-full h-full md:pl-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={channel}
                initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full h-full"
              >
                {channel === 'LATEST' && <ChannelLatest feed={feed} />}
                {channel === 'SOUND' && <ChannelSound />}
                {channel === 'VISION' && <ChannelVision />}
                {channel === 'THREADS' && <ChannelThreads />}
                {channel === 'BOXOFFICE' && <BoxOffice />}
                {channel === 'INTEL' && <ChannelIntel />}
                {channel === 'CHAT' && <ChannelChat />}
                {channel === 'BOOKING' && <ChannelBooking />}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Channel Switch Glitch Overlay */}
          <AnimatePresence>
            {isChanging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black pointer-events-none"
              >
                <div className="absolute inset-0 intense-static opacity-60" />
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <div className="w-full h-[2px] bg-signal-green/50 animate-pulse" />
                  <div className="relative">
                    <div className="text-[15vw] font-black text-white italic chromatic-aberration leading-none">
                      CH {activeChannelNum}
                    </div>
                    <div className="absolute -top-4 -right-4 text-signal-green text-xs font-mono animate-ping">
                      SIGNAL_ACQUIRED
                    </div>
                  </div>
                  <div className="w-full h-[2px] bg-signal-green/50 animate-pulse" />
                  <div className="mt-4 text-[10px] text-white/40 font-mono tracking-[1em] uppercase">
                    Frequency Shift In Progress...
                  </div>
                </div>
                {/* RGB Split Glitch Bars */}
                <div className="absolute top-1/4 left-0 w-full h-20 bg-red-500/10 mix-blend-screen animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="absolute top-1/2 left-0 w-full h-10 bg-blue-500/10 mix-blend-screen animate-pulse" style={{ animationDelay: '0.2s' }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spotify Stream Audio Widget */}
          <AnimatePresence>
            {isHumActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="fixed bottom-24 md:bottom-28 left-6 md:left-24 z-50 w-72 md:w-80 shadow-2xl rounded-xl overflow-hidden border border-white/10"
              >
                <iframe
                  title="Spotify Background Player"
                  src="https://open.spotify.com/embed/artist/0bFrhCc82qmydNx8NCRY9e?utm_source=generator&theme=0"
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="bg-black"
                ></iframe>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hum Toggle Control */}
          <div className="fixed bottom-24 md:bottom-12 left-6 z-50 flex items-center gap-3">
            <button
              onClick={() => setIsHumActive(!isHumActive)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-all ${isHumActive ? 'bg-signal-green border-signal-green text-onyx shadow-[0_0_15px_rgba(0,255,65,0.5)]' : 'bg-black/40 border-white/20 text-white/40 hover:border-white/60'}`}
              title="Toggle Spotify Stream"
            >
              <Radio size={14} className={isHumActive ? 'animate-pulse' : ''} />
            </button>
            <div className="hidden md:block">
              <div className="text-[8px] text-white/20 font-mono uppercase tracking-widest">Spotify Radio</div>
              <div className={`text-[10px] font-bold font-mono uppercase ${isHumActive ? 'text-signal-green' : 'text-white/20'}`}>
                {isHumActive ? 'ONLINE' : 'Offline'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

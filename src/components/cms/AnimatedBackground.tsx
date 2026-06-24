import React from 'react';
import { motion } from 'motion/react';

export function AnimatedBackground({ type }: { type: string }) {
  switch (type) {
    case 'blobs':
      return <BlobsAnimation />;
    case 'waves':
      return <WavesAnimation />;
    case 'particles':
      return <ParticlesAnimation />;
    case 'neon-lines':
      return (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[2px] bg-[#00ffff] shadow-[0_0_20px_rgba(0,255,255,0.8)]"
              style={{ top: `${30 + i * 20}%`, left: 0, right: 0 }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.7, ease: "linear" }}
            />
          ))}
        </div>
      );
    case 'radial-pulse':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-40 h-40 border-2 border-white/30 rounded-full"
          />
        </div>
      );
    case 'grid':
    default:
      return <GridAnimation />;
  }
}

function BlobsAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, 40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute top-[0%] right-[0%] w-[350px] h-[350px] bg-white/40 rounded-full blur-[80px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.4, 1],
          x: [0, -40, 0],
          y: [0, -40, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[0%] left-[0%] w-[450px] h-[450px] bg-white/20 rounded-full blur-[100px]"
      />
    </div>
  );
}

function WavesAnimation() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 600" preserveAspectRatio="none">
      <motion.path
        animate={{ d: ["M0 200 Q100 150 200 200 T400 200 V600 H0 Z", "M0 220 Q100 270 200 220 T400 220 V600 H0 Z", "M0 200 Q100 150 200 200 T400 200 V600 H0 Z"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        fill="white"
      />
      <motion.path
        animate={{ d: ["M0 250 Q100 300 200 250 T400 250 V600 H0 Z", "M0 230 Q100 180 200 230 T400 230 V600 H0 Z", "M0 250 Q100 300 200 250 T400 250 V600 H0 Z"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        fill="white"
        opacity="0.5"
      />
    </svg>
  );
}

function ParticlesAnimation() {
  return (
    <div className="absolute inset-0">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/30 rounded-full blur-[1px]"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

function GridAnimation() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-12">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-20 w-full"
        animate={{ y: [-100, 600] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

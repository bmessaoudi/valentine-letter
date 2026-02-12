import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AppPhase = "envelope" | "card" | "success";

const MOCHI_GIF =
  "https://media1.tenor.com/m/MHcdyIl-GGkAAAAd/mochi-mochimochi.gif";
const SUCCESS_GIF =
  "https://media1.tenor.com/m/fb9hXsPMb7wAAAAC/mochi-mochi-peach-cat-kiss.gif";

const spring = { type: "spring" as const, stiffness: 300, damping: 24 };
const bouncySpring = { type: "spring" as const, stiffness: 500, damping: 15 };

// ─── Confetti (kawaii) ──────────────────────────────────────
function Confetti() {
  const pieces = useMemo(() => {
    const emojis = ["❤️", "💕", "💖", "💗", "💘", "✨", "💝", "💓"];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 3,
      size: 14 + Math.random() * 18,
      rotation: Math.random() * 720 - 360,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      drift: (Math.random() - 0.5) * 120,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -30, x: 0, opacity: 0, rotate: 0, scale: 0 }}
          animate={{
            y: "100vh",
            x: [0, p.drift, p.drift * -0.5],
            opacity: [0, 1, 1, 0],
            rotate: p.rotation,
            scale: [0, 1.2, 1, 0.6],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          className="absolute"
          style={{ left: p.left, fontSize: p.size }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Polaroid Frame ─────────────────────────────────────────
function PolaroidFrame({
  src,
  alt,
  rotate,
}: {
  src: string;
  alt: string;
  rotate?: [number, number, number];
}) {
  return (
    <motion.div
      className="mb-6"
      animate={{ rotate: rotate ?? [-2, 1, -2] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "8px 8px 32px 8px",
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        {/* Scotch tape */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%) rotate(2deg)",
            width: 56,
            height: 16,
            background:
              "linear-gradient(180deg, rgba(255,235,180,0.55), rgba(255,225,150,0.45))",
            borderRadius: 2,
            zIndex: 1,
            border: "1px solid rgba(200,180,120,0.15)",
          }}
        />
        <img
          src={src}
          alt={alt}
          className="w-48 h-48 md:w-56 md:h-56 object-cover"
          style={{ display: "block", borderRadius: 2 }}
        />
      </div>
    </motion.div>
  );
}

// ─── Kawaii Envelope (CSS divs, no SVG) ─────────────────────
function KawaiiEnvelope({ onOpenComplete }: { onOpenComplete: () => void }) {
  const [isOpening, setIsOpening] = useState(false);

  return (
    <motion.div
      key="envelope"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.9 }}
      transition={spring}
      className="flex flex-col items-center"
    >
      <motion.div
        className={`relative ${!isOpening ? "cursor-pointer" : ""}`}
        whileHover={!isOpening ? { scale: 1.05 } : undefined}
        whileTap={!isOpening ? { scale: 0.97 } : undefined}
        onClick={() => {
          if (!isOpening) setIsOpening(true);
        }}
        style={{ width: 300, height: 280, perspective: 800 }}
      >
        {/* Envelope body */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 300,
            height: 190,
            background: "linear-gradient(to bottom, #fca5a5, #f87171)",
            borderRadius: "0 0 16px 16px",
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          {/* V-fold decoration */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              clipPath: "polygon(0 0, 50% 65%, 100% 0)",
              background: "linear-gradient(to bottom, #ef4444, #dc2626)",
              opacity: 0.6,
            }}
          />
          {/* Bottom edge highlight */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: 15,
              background: "#ef4444",
              opacity: 0.3,
              borderRadius: "0 0 16px 16px",
            }}
          />
        </div>

        {/*
          Flap — triangle with BASE at bottom, POINT at top.
          polygon(0 100%, 50% 0, 100% 100%) → full bottom edge flush with body top.
          transformOrigin: bottom center → rotates at the fold line.
          Starts at rotateX:180 (folded down over body = closed).
          Opens to rotateX:0 (pointing up = open).
          Gradient: natural bottom=#fca5a5 matches body top when flipped.
        */}
        <motion.div
          initial={{ rotateX: 180 }}
          animate={isOpening ? { rotateX: 0 } : { rotateX: 180 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 300,
            height: 90,
            transformOrigin: "bottom center",
            zIndex: isOpening ? 1 : 10,
            clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
            background: "linear-gradient(to bottom, #ef4444, #fca5a5)",
          }}
        />

        {/* Heart seal (disappears on open) */}
        <AnimatePresence>
          {!isOpening && (
            <motion.div
              className="absolute flex items-center justify-center"
              style={{
                top: 135,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 15,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="text-3xl drop-shadow-md"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ❤️
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card sliding out */}
        <AnimatePresence>
          {isOpening && (
            <motion.div
              className="absolute rounded-2xl shadow-lg flex items-center justify-center"
              style={{
                width: 230,
                height: 140,
                left: 35,
                top: 100,
                zIndex: 5,
                background: "linear-gradient(135deg, #fff5f5, #ffffff)",
                border: "2px solid #fca5a5",
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -200, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.3,
              }}
              onAnimationComplete={() => onOpenComplete()}
            >
              <span className="text-2xl">💌</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "per te" text */}
        <div
          className="absolute w-full text-center"
          style={{
            bottom: 20,
            zIndex: 6,
            fontFamily: "var(--font-romantic)",
            fontSize: 30,
            color: "#fff",
          }}
        >
          per te
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── App ────────────────────────────────────────────────────
function App() {
  const [phase, setPhase] = useState<AppPhase>("envelope");
  const [extraButtons, setExtraButtons] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  // Preload GIFs during envelope phase
  useEffect(() => {
    const img1 = new Image();
    img1.src = MOCHI_GIF;
    const img2 = new Image();
    img2.src = SUCCESS_GIF;
  }, []);

  const handleNo = useCallback(() => {
    const MIN_DIST = 18;
    const count = 3;
    setExtraButtons((old) => {
      const placed = old.map((b) => ({ x: b.x, y: b.y }));
      const newButtons: { id: number; x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) {
        let x: number, y: number;
        let attempts = 0;
        do {
          x = Math.random() * 60 + 20;
          y = Math.random() * 25 + 65;
          attempts++;
        } while (
          attempts < 80 &&
          [...placed, ...newButtons].some(
            (p) => Math.hypot(p.x - x, p.y - y) < MIN_DIST
          )
        );
        const btn = { id: Date.now() + i, x, y };
        newButtons.push(btn);
        placed.push({ x, y });
      }
      return [...old, ...newButtons];
    });
  }, []);

  const handleYes = useCallback(() => setPhase("success"), []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fef2f2 100%)",
      }}
    >
      <AnimatePresence mode="wait">
        {/* ── Envelope Phase ── */}
        {phase === "envelope" && (
          <KawaiiEnvelope
            key="envelope-phase"
            onOpenComplete={() => setPhase("card")}
          />
        )}

        {/* ── Card Phase ── */}
        {phase === "card" && (
          <motion.div
            key="card-phase"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={spring}
            className="relative max-w-sm w-full flex flex-col items-center text-center z-10"
            style={{
              background:
                "linear-gradient(180deg, #fff5f5 0%, #ffffff 40%, #fef2f2 100%)",
              border: "2px solid #fca5a5",
              borderRadius: 28,
              padding: "2rem",
              boxShadow: "0 10px 40px rgba(239, 68, 68, 0.15)",
            }}
          >
            {/* GIF — Polaroid */}
            <PolaroidFrame src={MOCHI_GIF} alt="Mochi carino" />

            {/* Question */}
            <p
              className="text-2xl md:text-3xl font-bold mb-6"
              style={{
                fontFamily: "var(--font-romantic)",
                color: "#b91c1c",
              }}
            >
              Vuoi essere la mia Valentina?
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full items-center relative z-10">
              <motion.button
                onClick={handleYes}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="font-bold py-3 px-10 rounded-full text-lg text-white cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                }}
              >
                Si 💕
              </motion.button>
              <motion.button
                onClick={handleNo}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="font-bold py-3 px-10 rounded-full text-lg cursor-pointer relative z-10"
                style={{
                  background: "transparent",
                  border: "2px solid #fca5a5",
                  color: "#f87171",
                }}
              >
                No 😢
              </motion.button>
            </div>

            {/* Random "Si" buttons area */}
            {extraButtons.length > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  zIndex: 20,
                  pointerEvents: "none",
                  borderRadius: 28,
                }}
              >
                {extraButtons.map((btn) => (
                  <motion.button
                    key={btn.id}
                    onClick={handleYes}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={bouncySpring}
                    className="absolute font-bold py-2 px-5 rounded-full text-base text-white cursor-pointer shadow-md"
                    style={{
                      left: `${btn.x}%`,
                      top: `${btn.y}%`,
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "auto",
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      boxShadow: "0 3px 10px rgba(239, 68, 68, 0.35)",
                    }}
                  >
                    Si 💕
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Success Phase ── */}
        {phase === "success" && (
          <motion.div
            key="success-phase"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="relative max-w-sm w-full flex flex-col items-center text-center z-10"
            style={{
              background:
                "linear-gradient(180deg, #fff5f5 0%, #ffffff 40%, #fef2f2 100%)",
              border: "2px solid #fca5a5",
              borderRadius: 28,
              padding: "2rem",
              boxShadow: "0 10px 40px rgba(239, 68, 68, 0.15)",
            }}
          >
            <Confetti />

            {/* Pulsing heart */}
            <motion.div
              className="text-5xl mb-2"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              💖
            </motion.div>

            {/* "Yay!" with gradient */}
            <h1
              className="text-5xl md:text-6xl font-bold leading-tight mb-4"
              style={{
                fontFamily: "var(--font-romantic)",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Yay!
            </h1>

            {/* GIF — Polaroid */}
            <PolaroidFrame
              src={SUCCESS_GIF}
              alt="Festeggiamento"
              rotate={[1, -2, 1]}
            />

            {/* Text with delayed fade-in */}
            <motion.p
              className="text-xl md:text-2xl"
              style={{
                fontFamily: "var(--font-romantic)",
                color: "#b91c1c",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              ci vediamo il 14 febbraio ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

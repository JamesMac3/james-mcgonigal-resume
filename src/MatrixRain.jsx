import { useEffect, useRef } from 'react';

// A single, resolution-capped canvas keeps the code field light on mobile.
export default function MatrixRain({ warp = false, quiet = false, red = false }) {
  const canvas = useRef(null);
  const settings = useRef({ warp, quiet, red });
  useEffect(() => { settings.current = { warp, quiet, red }; }, [warp, quiet, red]);
  useEffect(() => {
    const surface = canvas.current;
    const context = surface.getContext('2d');
    if (!context) return;
    let width = 0;
    let height = 0;
    let streams = [];
    let frame;
    let previous = 0;
    let lastPalette = settings.current.red;
    const glyphs = '01アイウエオカキクケコサシスセソタチツテト<>:{}';
    const resize = () => {
      width = surface.clientWidth; height = surface.clientHeight;
      surface.width = width; surface.height = height;
      streams = Array.from({ length: Math.ceil(width / 22) }, (_, i) => ({ x: i * 22, y: Math.random() * height, speed: 0.6 + Math.random() * 1.8, seed: i * 17 }));
      previous = 0;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    function draw(time) {
      frame = requestAnimationFrame(draw);
      if (lastPalette !== settings.current.red) { context.clearRect(0, 0, width, height); previous = 0; lastPalette = settings.current.red; }
      if (document.hidden || (settings.current.quiet && previous > 0) || time - previous < 45) return;
      previous = time;
      context.fillStyle = settings.current.red ? 'rgba(8,2,3,.17)' : settings.current.warp ? 'rgba(2,8,6,.13)' : 'rgba(2,8,6,.17)';
      context.fillRect(0, 0, width, height);
      context.font = '12px monospace';
      for (const stream of streams) {
        const char = glyphs[(Math.floor(time / 180) + stream.seed) % glyphs.length];
        context.fillStyle = settings.current.red ? (stream.seed % 3 ? '#bc4259' : '#ffc1cb') : (stream.seed % 3 ? '#478e69' : '#b8f9c8');
        context.fillText(char, stream.x, stream.y);
        if (settings.current.warp) {
          context.strokeStyle = '#81ffb052';
          context.beginPath(); context.moveTo(stream.x, stream.y);
          context.lineTo(stream.x + (stream.x - width / 2) * .03, stream.y + 75); context.stroke();
        }
        if (!settings.current.quiet) stream.y += stream.speed * (settings.current.warp ? 28 : 9);
        if (stream.y > height + 20) stream.y = -Math.random() * 200;
      }
    }
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);
  return <canvas ref={canvas} className="matrix-rain" aria-hidden="true" />;
}

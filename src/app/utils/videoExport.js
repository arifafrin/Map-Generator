import * as Mp4Muxer from 'mp4-muxer';

/**
 * Premium 4K Video Rendering Engine
 * Computes frame-by-frame animation states independently of the DOM
 * to guarantee perfect 4K 60fps output into an MP4 container.
 */

// Easing function (ease-out cubic)
const easeOut = t => (--t) * t * t + 1;
// Easing function (ease-in-out cubic)
const easeInOut = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export async function renderMapAnimationOptions(svgNode, config) {
  // Ultra-High Quality 4K rendering configuration
  let { 
    width = 3840, 
    height = 2160, 
    fps = 60, 
    durationSec = 5, 
    animationStyle = 'reveal', 
    animationSpeed = 1,
    bgColor = '#0a1628',
    onProgress = () => {} 
  } = config;

  return new Promise(async (resolveMain, rejectMain) => {
    try {
      // 1. Dynamic Hardware Capabilities Check
      // Standard laptops often completely freeze (hang) when pushed to 4K H264 High Profile if the GPU lacks support.
      const profilesToTry = [
        { name: '4K', w: 3840, h: 2160, codec: 'avc1.640034', br: 40_000_000 },
        { name: '1440p', w: 2560, h: 1440, codec: 'avc1.4d0032', br: 30_000_000 },
        { name: '1080p', w: 1920, h: 1080, codec: 'avc1.4d002a', br: 30_000_000 }
      ];

      let selectedConfig = null;
      for (const p of profilesToTry) {
        const testConfig = { codec: p.codec, width: p.w, height: p.h, bitrate: p.br, framerate: fps };
        try {
           const support = await VideoEncoder.isConfigSupported(testConfig);
           if (support.supported) {
             selectedConfig = p;
             break;
           }
        } catch (e) { /* continue probing */ }
      }

      if (!selectedConfig) {
        throw new Error("No hardware supported H264 video encoding profiles found.");
      }

      console.log(`VideoEngine: Selected Profile [${selectedConfig.name}] with bitate ${selectedConfig.br/1000000}Mbps`);
      
      // Override local vars to matching supported profile
      width = selectedConfig.w;
      height = selectedConfig.h;

      // Clone the SVG so we can manipulate it
      const clone = svgNode.cloneNode(true);
      clone.setAttribute('width', width);
      clone.setAttribute('height', height);
      const originalViewBox = clone.getAttribute('viewBox') || `0 0 ${width} ${height}`;
      
      // Set up WebCodecs and Muxer
      let muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width: width,
          height: height
        },
        fastStart: 'in-memory'
      });

      let videoEncoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: e => {
          console.error("WebCodecs Encoding Error:", e);
          rejectMain(new Error("Video Encoder failed. Your hardware might have dropped the frame."));
        }
      });

      videoEncoder.configure({
        codec: selectedConfig.codec, 
        width: width,
        height: height,
        bitrate: selectedConfig.br, 
        framerate: fps
      });

      const totalFrames = fps * durationSec;
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');

  // Strip CSS animation classes so we can manually control inline styles
  const animatedElements = [];
  
  // Extract regions that have our animation classes
  const paths = clone.querySelectorAll('path.transition-all');
  paths.forEach((path, idx) => {
    // Remove the CSS animation class
    const tempClass = path.getAttribute('className') || path.getAttribute('class') || '';
    path.setAttribute('class', tempClass.replace(/map-anim-\w+/g, '').trim());
    
    // Store original states
    animatedElements.push({
      el: path,
      idx: idx,
      baseOpacity: parseFloat(path.style.opacity || '1'),
      baseFilter: path.style.filter || 'none',
      baseTransform: path.getAttribute('transform') || ''
    });
  });

  // Frame computation function
  const prepareSVGFrame = (frame) => {
    const time = (frame / fps); // seconds
    const animSpeed = 1 / animationSpeed; 

    animatedElements.forEach(({ el, idx, baseOpacity }) => {
      const delay = (idx * 0.05) / animationSpeed;
      // Local time for this specific element
      const localTime = Math.max(0, time - delay);
      
      // For continuous looping of single-shot animations (Reveal, Draw), we use a repeating cycle.
      // E.g. cycle every 4 seconds so it repeats beautifully in 10s exports.
      const cycleTime = 4 / animationSpeed;
      const loopedTime = localTime % cycleTime;
      
      let p = loopedTime / animSpeed; // progression [0, 1] for keyframes

      switch(animationStyle) {
        case 'assemble': {
          // Half duration for build, half for pulse.
          const halfTime = durationSec / 2;
          if (time < halfTime) {
             let revealP = localTime / animSpeed;
             if (revealP < 0) {
                 el.style.opacity = '0';
                 el.style.transform = 'scale(0.85)';
             } else if (revealP < 1) {
                 const ease = easeOut(revealP);
                 el.style.opacity = (ease * baseOpacity).toString();
                 el.style.transform = `scale(${0.85 + (ease * 0.15)})`;
                 el.style.transformOrigin = 'center center';
             } else {
                 el.style.opacity = baseOpacity;
                 el.style.transform = 'scale(1)';
             }
          } else {
             // Second half: jump/pulse gently (lafabe)
             const pulseTime = time - halfTime; 
             const jumpPhase = Math.sin(pulseTime * 4 + idx * 0.5); // wave delay
             const modulatedOpacity = 0.7 + ((jumpPhase + 1)/2) * 0.3; 
             
             el.style.opacity = (modulatedOpacity * baseOpacity).toString();
             el.style.transform = `translateY(${jumpPhase * -3}px) scale(${1 + jumpPhase * 0.01})`;
          }
          break;
        }

        case 'reveal':
          // Reset slightly before the cycle restarts to create a smooth looping staggered effect
          if (p < 0 || p > 1.2) {
             el.style.opacity = '0';
             el.style.transform = 'scale(0.85)';
          } else if (p > 1 && p <= 1.2) {
             // Hold the fully revealed state for a moment before the next loop
             el.style.opacity = baseOpacity;
             el.style.transform = 'scale(1)';
          } else {
             const ease = easeOut(p);
             el.style.opacity = (ease * baseOpacity).toString();
             el.style.transform = `scale(${0.85 + (ease * 0.15)})`;
             el.style.transformOrigin = 'center center';
          }
          break;

        case 'draw':
          const dashMax = 2000;
          let drawP = loopedTime / (animSpeed * 2.5); // Draw takes a bit longer
          
          if (drawP <= 0 || drawP > 1.1) {
            el.style.strokeDashoffset = dashMax;
            el.style.strokeDasharray = dashMax;
            el.style.opacity = '0';
          } else if (drawP > 1 && drawP <= 1.1) {
            el.style.strokeDashoffset = '0';
            el.style.opacity = baseOpacity;
          } else {
            const ease = easeOut(drawP);
            el.style.strokeDasharray = dashMax;
            el.style.strokeDashoffset = dashMax * (1 - ease);
            el.style.opacity = (0.4 + ease * 0.6).toString();
          }
          break;

        case 'wave':
          const wavePhase = (Math.sin(time * 3 - idx * 0.1) + 1) / 2; // [0, 1]
          el.style.opacity = (0.3 + wavePhase * 0.7).toString();
          // el.setAttribute('transform', `translateY(${-2 + wavePhase * 5}px)`);
          break;

        case 'pulse':
          const pulsePhase = (Math.sin(time * 5) + 1) / 2;
          el.style.opacity = (0.6 + pulsePhase * 0.4).toString();
          break;
          
        case 'breathe':
          const breathePhase = (Math.sin(time * 2) + 1) / 2;
          el.style.opacity = (0.5 + breathePhase * 0.5).toString();
          break;

        case 'float':
          const floatPhase = Math.sin(time * 2 + idx * 0.05);
          el.style.transform = `translateY(${floatPhase * -4}px)`;
          break;
          
        case 'radar':
          const radarPhase = (time * 1.5 - idx * 0.02) % 1;
          const isHot = radarPhase > 0 && radarPhase < 0.2;
          el.style.opacity = isHot ? '1' : '0.3';
          if (isHot) el.style.filter = 'brightness(1.5)';
          else el.style.filter = 'none';
          break;

        case 'colorshift':
          const huePhase = (time * 60) % 360;
          el.style.filter = `hue-rotate(${huePhase}deg)`;
          break;

        default:
          el.style.opacity = baseOpacity;
          break;
      }
    });

    // Serialize
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clone);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  };

  // Rendering loop
  for (let frame = 0; frame < totalFrames; frame++) {
    onProgress({ frame, total: totalFrames, percent: Math.round((frame / totalFrames) * 100) });
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const dataUrl = prepareSVGFrame(frame);
    const img = new Image();
    
    // Wait for the SVG image to successfully load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });

    // Draw the image exactly centering the SVG viewport
    ctx.drawImage(img, 0, 0, width, height);

    // Create the video frame and encode
    const timestampUs = Math.round((frame / fps) * 1_000_000);
    const videoFrame = new VideoFrame(canvas, { timestamp: timestampUs });
    
    // CRITICAL MEMORY STABILITY FIX: Backpressure
    // Shoving 600 4K frames into the encoder at once crashes the browser due to RAM exhaustion.
    // We throttle the loop, pausing generation if the hardware encoder queue has more than 5 frames pending.
    while (videoEncoder.encodeQueueSize > 5) {
      await new Promise(r => setTimeout(r, 10)); // tiny sleep
    }

    // Force a keyframe every 1 second.
    const isKeyFrame = (frame % fps === 0);
    videoEncoder.encode(videoFrame, { keyFrame: isKeyFrame });
    
    videoFrame.close();
    img.src = ''; // help GC
  }

  // Finalize
  onProgress({ frame: totalFrames, total: totalFrames, percent: 100, finishing: true });
  
  // Safe flush with an extended timeout in case the hardware is just slow
  await Promise.race([
    videoEncoder.flush(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Encoder flush timeout.")), 30000))
  ]);

  videoEncoder.close();
  muxer.finalize();
  
  const buffer = muxer.target.buffer;
  const blob = new Blob([buffer], { type: 'video/mp4' });
  
  resolveMain(blob);
  
    } catch (err) {
      console.error("Critical rendering pipeline error:", err);
      rejectMain(err);
    }
  });
}

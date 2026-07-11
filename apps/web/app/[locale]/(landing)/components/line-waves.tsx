"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

/**
 * LineWaves — adapted from ReactBits (reactbits.dev, MIT).
 *
 * Warped contour-line waves rendered in a fragment shader, with
 * cursor-reactive distortion. All original props are kept: speed,
 * inner/outer line counts, warp intensity, rotation, edge fade, color
 * cycling, brightness, three color channels, mouse interaction +
 * influence. Hyperion adaptations:
 *  - mouse listeners live on window with coordinates normalized
 *    against the container — content stacked above the canvas would
 *    otherwise swallow every event
 *  - render loop pauses via IntersectionObserver when off-screen
 *  - device pixel ratio capped at 2
 *  - Tailwind classes instead of a CSS file; zero React state
 *  - defaults tuned monochrome: all three channels platinum
 */

interface LineWavesProps {
  brightness?: number;
  className?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  colorCycleSpeed?: number;
  edgeFadeWidth?: number;
  enableMouseInteraction?: boolean;
  innerLineCount?: number;
  mouseInfluence?: number;
  outerLineCount?: number;
  rotation?: number;
  speed?: number;
  style?: CSSProperties;
  warpIntensity?: number;
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    Number.parseInt(h.slice(0, 2), 16) / 255,
    Number.parseInt(h.slice(2, 4), 16) / 255,
    Number.parseInt(h.slice(4, 6), 16) / 255,
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.2;
  result += sin(coord * 3.234 + t * 4.345) * 0.1;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.3;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;
  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`;

export default function LineWaves({
  speed = 0.3,
  innerLineCount = 32.0,
  outerLineCount = 36.0,
  warpIntensity = 1.0,
  rotation = -45,
  edgeFadeWidth = 0.0,
  colorCycleSpeed = 1.0,
  brightness = 0.2,
  color1 = "#eeeeed",
  color2 = "#eeeeed",
  color3 = "#eeeeed",
  enableMouseInteraction = true,
  mouseInfluence = 2.0,
  className,
  style,
}: LineWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetMouse = useRef({ x: 0.5, y: 0.5 });
  const currentMouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: [
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        ] as [number, number, number],
      },
      uSpeed: { value: speed },
      uInnerLines: { value: innerLineCount },
      uOuterLines: { value: outerLineCount },
      uWarpIntensity: { value: warpIntensity },
      uRotation: { value: (rotation * Math.PI) / 180 },
      uEdgeFadeWidth: { value: edgeFadeWidth },
      uColorCycleSpeed: { value: colorCycleSpeed },
      uBrightness: { value: brightness },
      uColor1: { value: hexToVec3(color1) },
      uColor2: { value: hexToVec3(color2) },
      uColor3: { value: hexToVec3(color3) },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uMouseInfluence: { value: mouseInfluence },
      uEnableMouse: { value: enableMouseInteraction },
    };

    const resize = () => {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      uniforms.uResolution.value = [
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      ];
    };
    window.addEventListener("resize", resize);
    resize();

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms,
    });
    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    // Window-level pointer input — overlays and page content sit above
    // the canvas, so canvas-level listeners would never fire.
    // Coordinates are normalized against the container's rect; outside
    // it the warp eases back to center.
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) {
        targetMouse.current = { x: 0.5, y: 0.5 };
        return;
      }
      targetMouse.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1.0 - (e.clientY - rect.top) / rect.height,
      };
    };
    if (enableMouseInteraction) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    let animationFrameId: number | null = null;
    let visible = true;

    const update = (time: number) => {
      if (!visible) {
        animationFrameId = null;
        return;
      }
      animationFrameId = requestAnimationFrame(update);
      uniforms.uTime.value = time * 0.001;

      if (enableMouseInteraction) {
        currentMouse.current.x +=
          0.05 * (targetMouse.current.x - currentMouse.current.x);
        currentMouse.current.y +=
          0.05 * (targetMouse.current.y - currentMouse.current.y);
        uniforms.uMouse.value[0] = currentMouse.current.x;
        uniforms.uMouse.value[1] = currentMouse.current.y;
      } else {
        uniforms.uMouse.value[0] = 0.5;
        uniforms.uMouse.value[1] = 0.5;
      }

      renderer.render({ scene: mesh });
    };
    animationFrameId = requestAnimationFrame(update);

    // Pause rendering entirely while scrolled out of view.
    const io = new IntersectionObserver(([entry]) => {
      const nowVisible = !!entry?.isIntersecting;
      if (nowVisible && !visible) {
        visible = true;
        if (animationFrameId === null) {
          animationFrameId = requestAnimationFrame(update);
        }
      } else if (!nowVisible) {
        visible = false;
      }
    });
    io.observe(container);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      io.disconnect();
      window.removeEventListener("resize", resize);
      if (enableMouseInteraction) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    speed,
    innerLineCount,
    outerLineCount,
    warpIntensity,
    rotation,
    edgeFadeWidth,
    colorCycleSpeed,
    brightness,
    color1,
    color2,
    color3,
    enableMouseInteraction,
    mouseInfluence,
  ]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className ?? ""}`}
      ref={containerRef}
      style={style}
    />
  );
}

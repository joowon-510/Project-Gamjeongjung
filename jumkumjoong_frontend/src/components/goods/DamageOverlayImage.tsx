// src/components/goods/DamageOverlayImage.tsx
import React, { useRef, useEffect, useState } from "react";

interface DamageOverlayImageProps {
  imageUrl: string;
  damageStr: string; // e.g. "img.jpg>Damaged Keys:(x1,y1,x2,y2);Scratch:(x3,y3,x4,y4)"
  width?: number;
  height?: number;
}

const DamageOverlayImage: React.FC<DamageOverlayImageProps> = ({
  imageUrl,
  damageStr,
  width = 300,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 1,
    height: 1,
  });

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !damageStr) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const [_, rawDamage] = damageStr.split(">", 2);
    if (!rawDamage) return;

    const damageEntries = rawDamage.split(";").map((entry) => entry.trim());

    damageEntries.forEach((entry) => {
      const [type, coordStr] = entry.split(":");
      const coords = coordStr?.replace(/[()]/g, "").split(",").map(Number);
      if (coords && coords.length === 4) {
        const [x1, y1, x2, y2] = coords;
        const scaledX = (x1 / naturalSize.width) * width;
        const scaledY = (y1 / naturalSize.height) * height;
        const scaledW = ((x2 - x1) / naturalSize.width) * width;
        const scaledH = ((y2 - y1) / naturalSize.height) * height;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

        ctx.font = "12px sans-serif";
        ctx.fillStyle = "rgba(255,0,0,0.8)";
        ctx.fillText(type, scaledX + 2, scaledY + 12);
      }
    });
  }, [damageStr, width, height, naturalSize]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: "1px solid #ccc", borderRadius: 8 }}
    />
  );
};

export default DamageOverlayImage;

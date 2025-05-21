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

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setIsLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !damageStr || !isLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image first
    const img = new Image();
    img.onload = () => {
      // Border width for the damage indicators
      const borderWidth = 2;

      // Draw the image while maintaining aspect ratio
      const aspectRatio = img.naturalWidth / img.naturalHeight;

      let drawWidth = width;
      let drawHeight = height;

      if (width / height > aspectRatio) {
        // Canvas is wider than image
        drawWidth = height * aspectRatio;
      } else {
        // Canvas is taller than image
        drawHeight = width / aspectRatio;
      }

      // Center the image in the canvas
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      const [_, rawDamage] = damageStr.split(">", 2);
      if (!rawDamage) return;

      const damageEntries = rawDamage.split(";").map((entry) => entry.trim());

      damageEntries.forEach((entry) => {
        const colonIndex = entry.indexOf(":");
        if (colonIndex === -1) return;

        // const [type, coordStr] = entry.split(":");
        const type = entry.substring(0, colonIndex);
        const coordStr = entry.substring(colonIndex + 1);

        const coords = coordStr?.replace(/[()]/g, "").split(",").map(Number);
        if (coords && coords.length === 4) {
          const [x1, y1, x2, y2] = coords;

          // Make sure boxes fit within the canvas
          const scaledX = Math.max(
            borderWidth,
            Math.min(
              width - borderWidth,
              (x1 / naturalSize.width) * drawWidth + offsetX
            )
          );
          const scaledY = Math.max(
            borderWidth,
            Math.min(
              height - borderWidth,
              (y1 / naturalSize.height) * drawHeight + offsetY
            )
          );

          let scaledW = (((x2 - x1) * 3) / naturalSize.width) * drawWidth;
          let scaledH = (((y2 - y1) * 3) / naturalSize.height) * drawHeight;

          // Adjust width/height to keep the box within canvas bounds
          if (scaledX + scaledW > width - borderWidth) {
            scaledW = width - borderWidth - scaledX;
          }

          if (scaledY + scaledH > height - borderWidth) {
            scaledH = height - borderWidth - scaledY;
          }

          ctx.strokeStyle = "red";
          ctx.lineWidth = borderWidth;
          ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);
        }
      });
    };
    img.src = imageUrl;
  }, [damageStr, width, height, naturalSize, isLoaded, imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: "1px solid #ccc", borderRadius: 2 }}
    />
  );
};

export default DamageOverlayImage;

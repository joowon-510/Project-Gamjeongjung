import React, { useEffect, useRef } from "react";

interface CameraProps {
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          // videoRef.current.srcObject = stream;
          // videoRef.current.play();
          const video = videoRef.current;

          // 이전 스트림 정지 (중복 방지)
          const prevStream = video.srcObject as MediaStream;
          prevStream?.getTracks().forEach((track) => track.stop());

          video.srcObject = stream;

          // 안전한 재생 요청
          video.onloadedmetadata = () => {
            video.play().catch((err) => {
              console.error("비디오 재생 오류:", err);
            });
          };
        }
      } catch (error) {
        console.error("카메라 접근 오류:", error);
      }
    })();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const cropBoxSize = 288; // 중심 사각형 크기 (px)
    // const cropBoxSize = 256; // w-64 = 256px

    // 1. 비디오 요소의 실제 화면 내 크기
    const videoRect = video.getBoundingClientRect();

    // 2. 크롭 박스 위치 (가운데 정렬)
    const cropBoxLeft = (videoRect.width - cropBoxSize) / 2;
    const cropBoxTop = (videoRect.height - cropBoxSize) / 2;

    // 3. 화면 상 위치를 비디오 해상도 비율로 변환
    const scaleX = video.videoWidth / videoRect.width;
    const scaleY = video.videoHeight / videoRect.height;

    const sx = cropBoxLeft * scaleX;
    const sy = cropBoxTop * scaleY;
    const sWidth = cropBoxSize * scaleX;
    const sHeight = cropBoxSize * scaleY;

    // 4. 캔버스 크기 설정 (px 기준으로 저장)
    canvas.width = sWidth;
    canvas.height = sHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      const imageDataUrl = canvas.toDataURL("image/png");
      onCapture(imageDataUrl);
      onClose();
    }
  };

  const handleClose = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      {/* 비디오 요소 */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        playsInline
        muted
      />

      {/* 숨겨진 캔버스 */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* 블러 오버레이 - 4개 부분으로 분리 */}
      {/* 상단 블러 영역 */}
      <div
        className="absolute top-0 left-0 right-0 z-10 blur-section"
        style={{
          height: "calc(50% - 144px)",
          // backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      ></div>

      {/* 하단 블러 영역 */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 blur-section"
        style={{
          height: "calc(50% - 144px)",
          // backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      ></div>

      {/* 좌측 블러 영역 */}
      <div
        className="absolute top-1/2 left-0 z-10 blur-section"
        style={{
          height: "288px",
          width: "calc(50% - 144px)",
          transform: "translateY(-50%)",
          // backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      ></div>

      {/* 우측 블러 영역 */}
      <div
        className="absolute top-1/2 right-0 z-10 blur-section"
        style={{
          height: "288px",
          width: "calc(50% - 144px)",
          transform: "translateY(-50%)",
          // backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      ></div>

      {/* 가운데 사각형 테두리 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="w-[288px] h-[288px] border-4 border-white"></div>
      </div>

      {/* 버튼 컨트롤 */}
      <div className="absolute top-10 w-full z-30 flex justify-center gap-4">
        <button
          className="bg-white px-4 py-2 rounded font-bold text-black"
          onClick={handleCapture}
        >
          📸 사진 찍기
        </button>
        <button
          className="bg-red-500 px-4 py-2 rounded text-white font-bold"
          onClick={handleClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default CameraModal;

import React, { useEffect, useRef } from "react";
import Webcam from "react-webcam";

interface CameraProps {
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CROP_BOX_SIZE = 384;
const CROP_WIDTH = 288;
const CROP_HEIGHT = 384;

const videoConstraints = {
  facingMode: { ideal: "environment" },
};

const CameraModal: React.FC<CameraProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  //✅
  const webcamRef = useRef<Webcam>(null);

  const getBackCameraStream = async (): Promise<MediaStream | null> => {
    try {
      // ✅ 1. 일단 권한 요청 (label 보기 위함)
      await navigator.mediaDevices.getUserMedia({ video: true });

      // ✅ 2. 모든 비디오 디바이스 가져오기
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      // ✅ 3. 후면 카메라 탐색 (label 기반)
      const backCamera = videoDevices.find((device) =>
        /back|rear/i.test(device.label)
      );

      // ✅ 4. 후면 카메라가 있으면 해당 deviceId로 요청
      const constraints: MediaStreamConstraints = backCamera
        ? {
            video: { deviceId: { exact: backCamera.deviceId } },
            audio: false,
          }
        : {
            video: { facingMode: { ideal: "environment" } }, // fallback
            audio: false,
          };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const initCamera = async () => {
      const stream = await getBackCameraStream();
      if (stream && video) {
        video.srcObject = stream;
        await video.play();
      }
    };

    initCamera();

    return () => {
      if (video && video.srcObject instanceof MediaStream) {
        const stream = video.srcObject;
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    };
  }, []);

  const handleCapture = () => {
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;
    if (!webcam || !canvas) return;

    const video = webcam.video as HTMLVideoElement;

    // 1) 화면(HTML) 상의 크기
    const vw = video.clientWidth;
    const vh = video.clientHeight;

    // 2) 비디오 원본 해상도
    const sw = video.videoWidth;
    const sh = video.videoHeight;

    // 3) object-cover 방식으로 확대된 스케일
    //    cover는 가로·세로 중 더 크게 스케일링 됨
    const scale = Math.max(vw / sw, vh / sh);

    // 4) 확대된 비디오가 container보다 커진 만큼의 오프셋
    const dw = sw * scale; // 실제 렌더된 비디오 너비
    const dh = sh * scale; // 실제 렌더된 비디오 높이
    const offsetX = (dw - vw) / 2;
    const offsetY = (dh - vh) / 2;

    // 5) CSS 화면 상의 크롭 박스 좌표
    const cropW = CROP_WIDTH; // 288
    const cropH = CROP_HEIGHT; // 384
    const cropX = (vw - cropW) / 2;
    const cropY = (vh - cropH) / 2;

    // 6) 원본 픽셀 좌표로 변환
    const sx = (cropX + offsetX) / scale;
    const sy = (cropY + offsetY) / scale;
    const sWidth = cropW / scale;
    const sHeight = cropH / scale;

    // 7) 캔버스는 최종 크기(CROP_WIDTH×CROP_HEIGHT)로 고정
    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // 원본(sx,sy,sWidth,sHeight)을 0,0에서 cropW×cropH 크기로 그리기
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, cropW, cropH);

    const dataUrl = canvas.toDataURL("image/png");
    onCapture(dataUrl);
    onClose();
  };

  const BlurOverlay = ({
    position,
    style,
  }: {
    position: string;
    style: React.CSSProperties;
  }) => <div className={`absolute ${position} z-10`} style={style}></div>;

  return (
    <div className="fixed inset-0 z-[120] bg-black text-white">
      <Webcam
        audio={false}
        ref={webcamRef}
        videoConstraints={videoConstraints}
        className="absolute top-0 left-0 w-full h-full object-cover"
        mirrored={false}
        screenshotFormat="image/png"
        forceScreenshotSourceSize
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <BlurOverlay
        position="top-0 left-0 right-0"
        style={{
          height: "calc(50% - 192px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />
      <BlurOverlay
        position="bottom-0 left-0 right-0"
        style={{
          height: "calc(50% - 192px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />
      <BlurOverlay
        position="top-1/2 left-0"
        style={{
          height: `${CROP_BOX_SIZE}px`,
          width: "calc(50% - 144px)",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />
      <BlurOverlay
        position="top-1/2 right-0"
        style={{
          height: `${CROP_BOX_SIZE}px`,
          width: "calc(50% - 144px)",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="w-[288px] h-[384px] border-4 border-white"></div>
      </div>

      <div className="absolute bottom-[64px] w-full z-50 flex justify-center gap-4">
        <button
          className="bg-white px-4 py-2 rounded font-bold text-black"
          onClick={handleCapture}
        >
          📸 사진 찍기
        </button>
        <button
          className="bg-red-500 px-4 py-2 rounded text-white font-bold"
          onClick={onClose}
          // onClick={handleClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default CameraModal;

import React, { useEffect, useRef } from "react";
import Webcam from "react-webcam";

interface CameraProps {
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CROP_BOX_SIZE = 384;

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
      console.error("카메라 접근 오류:", error);
      return null;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const initCamera = async () => {
      // try {
      //   const stream = await navigator.mediaDevices.getUserMedia({
      //     video: {
      //       facingMode: { ideal: "environment" },
      //     } satisfies MediaTrackConstraints,
      //     audio: false,
      //     // video: true,
      //   });
      //   const video = videoRef.current;

      //   if (video) {
      //     const prevStream = video.srcObject as MediaStream;
      //     prevStream?.getTracks().forEach((track) => track.stop());

      //     video.srcObject = stream;
      //     video.onloadedmetadata = () => {
      //       video
      //         .play()
      //         .catch((err) => console.error("비디오 재생 오류:", err));
      //     };
      //   }
      // } catch (error) {
      //   console.error("카메라 접근 오류:", error);
      // }
      const stream = await getBackCameraStream(); // ✅ 위에서 정의한 함수 호출
      if (stream && video) {
        video.srcObject = stream;
        await video.play();
      }
    };

    initCamera();

    return () => {
      // const stream = video?.srcObject as MediaStream;
      // stream?.getTracks().forEach((track) => track.stop());
      if (video && video.srcObject instanceof MediaStream) {
        const stream = video.srcObject;
        stream.getTracks().forEach((track) => track.stop()); // ✅ 트랙 정지
        video.srcObject = null; // ✅ 연결 해제
      }
    };
  }, []);

  const handleCapture = () => {
    // const video = videoRef.current;
    //✅
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;
    // if (!video || !canvas) return;

    //✅
    if (!webcam || !canvas) return;

    //✅
    const video = webcam.video as HTMLVideoElement;

    const videoRect = video.getBoundingClientRect();
    const cropLeft = (videoRect.width - CROP_BOX_SIZE) / 2;
    const cropTop = (videoRect.height - CROP_BOX_SIZE) / 2;

    const scaleX = video.videoWidth / videoRect.width;
    const scaleY = video.videoHeight / videoRect.height;

    const sx = cropLeft * scaleX;
    const sy = cropTop * scaleY;
    const sWidth = CROP_BOX_SIZE * scaleX;
    const sHeight = CROP_BOX_SIZE * scaleY;

    canvas.width = sWidth;
    canvas.height = sHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      const imageDataUrl = canvas.toDataURL("image/png");
      onCapture(imageDataUrl);

      // ✅ 카메라 스트림 중단 및 해제
      // const stream = video.srcObject as MediaStream;
      // stream?.getTracks().forEach((track) => track.stop());
      // video.srcObject = null;

      onClose();
    }
  };

  // const handleClose = () => {
  //   const stream = videoRef.current?.srcObject as MediaStream;
  //   stream?.getTracks().forEach((track) => track.stop());
  //   onClose();
  // };

  const BlurOverlay = ({
    position,
    style,
  }: {
    position: string;
    style: React.CSSProperties;
  }) => (
    <div
      className={`absolute ${position} z-10`}
      // className={`absolute ${position} z-10 blur-section`}
      style={style}
    ></div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black text-white">
      {/* <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        playsInline
        muted
      /> */}
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

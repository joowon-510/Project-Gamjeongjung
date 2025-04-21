import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import yeslogo from "../../assets/yeslogo.svg";
import kakaologo from "../../assets/kakaoLogin.svg"; // 카카오 로고 아이콘 (작은 사이즈)

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleKakaoLogin = async () => {
    try {
      setLoading(true);
      setError("");
      // 로그인 로직 처리
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // 성공 시 navigate('/home') 같은 라우팅 추가 가능
    } catch (err) {
      setError("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-white text-first">
      <div className="flex flex-col  mb-5 mt-0 pt-0">
        <p className="text-second underline underline-offset-4 font-semibold text-[24px] text-first mt-1">
          중고 전자기기 거래,
        </p>
        <p className="whitespace-prep-wrap font-semibold text-[20px] text-first mt-1">
          "감정중"으로 안심하고 시작하세요
        </p>
      </div>
      <img src={yeslogo} alt="감정중 로고" className="w-[240px] " />
      <p className="text-first text-[16px] text-center mb-2">
        로그인 후 이용해주세요.
      </p>

      <button
        onClick={handleKakaoLogin}
        className=" w-full max-w-[320px] flex items-center justify-center gap-2 shadow hover:brightness-105"
        disabled={loading}
      >
        <img src={kakaologo} alt="kakao" className="" />
        {/* 카카오로 간편 로그인 */}
      </button>

      {loading && (
        <p className="text-sm text-gray-500 mt-2">로그인 중입니다...</p>
      )}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      <div className="border-t border-gray-200 w-full max-w-[320px] my-6"></div>

      <button
        onClick={() => navigate(-1)}
        className="text-red-500 text-sm underline underline-offset-2 hover:text-red-600"
      >
        뒤로가기
      </button>
    </div>
  );
};

export default LoginPage;

// src/components/mypage/ActionSection.tsx 수정
import React from "react";
import { useNavigate } from "react-router-dom";
import settings from "../../assets/icons/settings.svg";
import logout from "../../assets/icons/logout.svg";
import Logout from "../../utils/logout";

const MyInfoSection: React.FC = () => {
  const navigate = useNavigate();

  // 로그아웃 처리
  const handleLogout = () => {
    Logout();
    // 로그인 페이지로 이동
    navigate("/login");
  };

  const handleEditInfo = () => {
    navigate("/edit/nickname");
  };

  return (
    <div className="bg-white rounded-lg mt-4 p-4 mb-4">
      <div className="space-y-0 flex flex-col gap-3">
        {/* 회원정보변경 */}
        <div
          className="flex flex-1  items-center pb-2 border-b border-gray-200 last:border-b-0"
          onClick={handleEditInfo}
        >
          <img src={settings} alt="settings" className="w-6 h-6 mr-4" />
          <p className="text-lg font-medium">회원정보변경</p>
        </div>
        {/* 로그아웃 */}
        <div
          className="flex flex-1 items-center pb-2 border-b border-gray-200 last:border-b-0"
          onClick={handleLogout}
        >
          <img src={logout} alt="logout" className="w-6 h-6 mr-4" />
          <p className="text-lg font-medium">로그아웃</p>
        </div>
      </div>
    </div>
  );
};

export default MyInfoSection;

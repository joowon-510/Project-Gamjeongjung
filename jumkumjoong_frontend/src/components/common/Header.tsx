// src/components/common/Header.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import yeslogo from "../../assets/yeslogo.svg";

interface HeaderProps {
  onSearch?: () => void;
  showBackButton?: boolean;
  title?: string;
  hideSearchButton?: boolean; // 검색 버튼 숨김 옵션
  showLogout?: boolean; // 로그아웃 버튼 표시 옵션 추가
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  showBackButton = false,
  title = "LOGO",
  hideSearchButton = false,
  showLogout = false, // 기본값은 로그아웃 버튼 숨김
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("검색어를 입력하세요.");

  // 뒤로가기 처리
  const handleGoBack = () => {
    navigate(-1);
  };

  // 검색 아이콘 클릭 처리
  const handleSearchClick = () => {
    if (onSearch) {
      onSearch();
    }
  };

  // 검색어 입력 처리
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    // 로그아웃 로직 구현
    localStorage.removeItem('token');
    // 로그인 페이지로 이동
    navigate('/login');
  };

  return (
    <header className="sticky top-0 left-0 w-full h-[96px] flex items-center shadow-md bg-white px-4 pt-2">
      <Link to="/">
        <img src={yeslogo} alt="logo" className="w-[96px] h-[96px] block" />
      </Link>
      
      {/* 로그아웃 버튼 또는 검색창 표시 */}
      {showLogout ? (
        <div className="w-[100%] h-10 self-center px-4 flex justify-end">
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-600"
          >
            <span>로그아웃</span>
            <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : !hideSearchButton ? (
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-[100%] h-10 self-center rounded-md bg-fourth text-first/70 px-4"
        />
      ) : (
        <p className="w-[100%] h-10 self-center px-4"></p>
      )}
    </header>
  );
};

export default Header;
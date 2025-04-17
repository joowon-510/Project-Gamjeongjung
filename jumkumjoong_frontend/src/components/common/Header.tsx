// src/components/common/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSearch?: () => void;
  showBackButton?: boolean;
  title?: string;
  hideSearchButton?: boolean; // 검색 버튼 숨김 옵션 추가

}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  showBackButton = false, 
  title = "LOGO", 
  hideSearchButton = false // 기본값은 검색 버튼 표시

}) => {
  const navigate = useNavigate();

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

  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="flex justify-between items-center h-16 px-4">
        {/* 왼쪽 영역 - 뒤로가기 또는 메뉴 아이콘 */}
        <div className="w-10">
          {showBackButton ? (
            <button className="p-2" onClick={handleGoBack}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <button className="p-2">
              <span className="text-2xl">≡</span>
            </button>
          )}
        </div>

        {/* 중앙 영역 - 로고 또는 제목 */}
        <div className="flex-1 flex justify-center">
          <div>
          <img
            src="/logo192.png"
            alt="로고"
            className="h-14 w-auto" />
          </div>
        </div>

        {/* 오른쪽 영역 - 검색 아이콘 */}
        <div className="w-10">
          {!hideSearchButton && (
            <button className="p-2" onClick={handleSearchClick}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
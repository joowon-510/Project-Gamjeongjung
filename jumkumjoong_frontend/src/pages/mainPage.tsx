import React from "react";
import laptop from "../assets/laptop.svg";
import keyboard from "../assets/keyboard.svg";
import phone from "../assets/phone.svg";
import tablet from "../assets/tablet.svg";
import example from "../assets/example.svg";
import NavigationBar from "../components/common/NavigationBar";
import Header from "../components/common/Header";
import { Link } from "react-router-dom";

const MainPage: React.FC = () => {
  return (
    <div className="container mx-auto text-first">
      {/* <header className="fixed top-0 left-0 w-[100%] flex row shadow-md bg-white px-4 pt-2">
        <img src={yeslogo} alt="logo" className="w-[96px] h-[96ppx]" />
        <input
          type="text"
          value="검색어를 입력하세요."
          className="w-[100%] h-10 self-center rounded-md bg-fourth text-first/70 px-4"
        />
      </header> */}
      <Header title="LOGO" showBackButton={false} hideSearchButton={false} />

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">채팅</h2>
          <div className="flex flex-col space-y-2">
            <Link
              to="/chat/list"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
            >
              채팅 목록
            </Link>
            <br />
            <Link
              to="/chat"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
            >
              채팅 페이지
            </Link>
          </div>
        </div>

        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">상품</h2>
          <div className="flex flex-col space-y-2">
            <Link
              to="/goods/list"
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
            >
              상품 목록
            </Link>
            <br />
            <Link
              to="/goods/detail/1"
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
            >
              상품 상세 보기
            </Link>
            <br />
            <Link
              to="/goods/register"
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
            >
              상품 등록
            </Link>
          </div>
        </div>

        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">사용자</h2>
          <div className="flex flex-col space-y-2">
            <Link
              to="/user/login"
              className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 text-center"
            >
              로그인
            </Link>
          </div>
        </div>
      </div> */}
      {/* <main className="font-semibold mb-4 gap-4 flex-1 overflow-y-auto"> */}
      <main className="font-semibold flex flex-col gap-4 mb-4 flex-1 overflow-y-auto">
        <article className="px-4 py-2 text-first">
          <p className="text-center text-[20px] my-3">
            내가 찾는 중고 물품을 찾아보세요.
          </p>
          <div className="flex gap-4">
            {/* 각 카테고리 */}
            <Link
              to="/goods/list"
              className="w-full h-fit bg-fourth px-2 rounded-lg"
            >
              {/* <div className=""> */}
              <img src={laptop} alt="laptop" className="w-[96px] h-[96px" />
              <p className="text-center pb-2">노트북</p>
              {/* </div> */}
            </Link>
            <div className="w-full h-fit bg-fourth px-2 rounded-lg">
              <img src={keyboard} alt="keyboard" className="w-[96px] h-[96px" />
              <p className="text-center pb-2">키보드</p>
            </div>
            <div className="w-full h-fit bg-fourth px-2 rounded-lg">
              <img src={phone} alt="phone" className="w-[96px] h-[96px" />
              <p className="text-center pb-2">휴대폰</p>
            </div>
            <div className="w-full h-fit bg-fourth px-2 rounded-lg">
              <img src={tablet} alt="tablet" className="w-[96px] h-[96px" />
              <p className="text-center pb-2">태블릿</p>
            </div>
          </div>
        </article>
        <article>
          <p className="pl-10 text-[20px]">오늘 인기 아이템</p>
          <div className="grid grid-flow grid-cols-2 gap-4 px-3 mt-2">
            <div>
              <img src={example} alt="example" className="w-[200px]" />
              <p>갤북5(S)급 팝니다</p>
            </div>
            <div>
              <img src={example} alt="example" className="w-[200px]" />
              <p>맥북pro 팔아용</p>
            </div>
            <div>
              <img src={example} alt="example" className="w-[200px]" />
              <p>갤북4 싸게 팝니다</p>
            </div>
            <div>
              <img src={example} alt="example" className="w-[200px]" />
              <p>그램 14인치</p>
            </div>
          </div>
        </article>
        <article>
          <p className="pl-10 text-[20px]">방금 등록된 아이템</p>
          <div className="grid grid-flow grid-cols-2 gap-4 px-3 mt-2">
            <div>
              <img src={example} alt="example" className="w-[200px]" />
              <p>갤북5(S)급 팝니다</p>
            </div>
            <div>
              <img src={example} alt="example" className="w-[200px]" />
              <p>맥북pro 팔아용</p>
            </div>
            <div>
              <img src={example} alt="example" className="w-[200px]" />
              <p>갤북4 싸게 팝니다</p>
            </div>
            <div>
              <img src={example} alt="example" className="w-[200px]" />
              <p>그램 14인치치</p>
            </div>
          </div>
        </article>
      </main>

      {/* 하단 네비게이션 바 */}
      {/* <div className="border-t"> */}
      <NavigationBar />
      {/* </div> */}
    </div>
  );
};

export default MainPage;

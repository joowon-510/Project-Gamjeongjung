// src/pages/TransactionsPage.tsx
import React from 'react';
import Header from '../../components/common/Header';
import NavigationBar from '../../components/common/NavigationBar';

const TransactionsPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 헤더 */}
      <Header showBackButton={true} title="거래 내역" hideSearchButton={true} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">거래 내역</h1>
          
          {/* 내용은 비워둠 */}
          <div className="text-center py-10 text-gray-500">
            거래 내역이 없습니다.
          </div>
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default TransactionsPage;
// src/components/goods/PriceInput.tsx
import React, { useState, useEffect } from 'react';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  id: string;
}

const PriceInput: React.FC<PriceInputProps> = ({ value, onChange, name, id }) => {
  // 화면에 표시될 숫자 (입력값)
  const [displayValue, setDisplayValue] = useState(value);
  
  // 입력값이 외부에서 변경될 경우 동기화
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);
  
  // 입력 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 숫자만 허용 (빈 문자열 또는 숫자)
    if (inputValue === '' || /^[0-9]+$/.test(inputValue)) {
      setDisplayValue(inputValue);
      onChange(inputValue);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        className="w-full p-2 pr-14 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="가격을 입력하세요"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-gray-500">만원</span>
      </div>
    </div>
  );
};

export default PriceInput;
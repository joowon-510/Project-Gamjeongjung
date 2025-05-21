import React, { useState, useEffect } from "react";

interface SerialNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  id: string;
  disabled?: boolean;
}

const SerialNumberInput: React.FC<SerialNumberInputProps> = ({
  value,
  onChange,
  name,
  disabled = false,
  id,
}) => {
  // 화면에 표시될 값값 (입력값)
  const [displayValue, setDisplayValue] = useState<string>(value.toString());

  // 입력값이 외부에서 변경될 경우 동기화
  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  return (
    <div className="">
      <input
        type="text"
        id={id}
        name={name}
        value={displayValue || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        placeholder="시리얼 번호를 입력하세요"
      />
    </div>
  );
};

export default SerialNumberInput;

// src/components/mypage/ActionSection.tsx 수정
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/useUserStore";
import Heart from "../../assets/icons/Heart.svg";

interface ActionSectionProps {
  userId: number;
  userName: string;
  userRating: number;
}

const ActionSection: React.FC<ActionSectionProps> = ({
  userId,
  userName,
  userRating,
}) => {
  const [nowStatus, setNowStatus] = useState<boolean>(true);

  useEffect(() => {
    if (useAuthStore.getState().nickname !== userName) {
      setNowStatus(false);
    }
  }, []);

  // 액션 항목 정의
  const actions = [
    {
      id: "favorites",
      status: nowStatus,
      icon: <img src={Heart} alt="" className="w-6 h-6" />,
      label: "찜한 목록",
      path: "/favorites",
    },
    {
      id: "posts",
      status: true,
      icon: (
        <svg
          className="w-6 h-6 text-gray-700"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      ),
      label: `${userName} 님이 작성한 글`,
      path: "/my-posts",
    },
  ];

  return (
    <div className="bg-white rounded-lg mt-4 p-4 mb-4">
      <div className="space-y-0">
        {actions.map((action) => {
          if (action.status) {
            return (
              <Link
                key={action.id}
                to={action.path}
                className="flex items-center py-4 border-b border-gray-200 last:border-b-0"
                state={{ userName: userName, userId: userId }}
              >
                <div className="mr-4">{action.icon}</div>
                <div className="text-lg font-medium">{action.label}</div>
              </Link>
            );
          } else {
            return <></>;
          }
        })}
      </div>
    </div>
  );
};

export default ActionSection;

// src/components/chat/ChatItem.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/dateFormatter';
import { getChatMessages } from '../../api/chat';

// ChatItem 컴포넌트의 Props 인터페이스
interface ChatItemProps {
  roomId: string;
  chattingUserNickname: string;
  nonReadCount: number;
  lastMessage: string;
  postTitle: string;
  createdAt?: string;
  lastUpdatedAt?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  roomId,
  chattingUserNickname,
  nonReadCount,
  lastMessage,
  postTitle,
  createdAt,
  lastUpdatedAt,
  isSelected = false,
  onSelect,
  onDelete
}) => {
  const navigate = useNavigate();

  const handleLongPress = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 링크 이동 방지
    if (onDelete) {
      onDelete();
    }
  };

  // src/components/chat/ChatItem.tsx (이미 구현되어 있음)
  const handleChatRoomEnter = async () => {
    try {
      // 채팅방 메시지 조회 API 호출
      const response = await getChatMessages(roomId);
      
      if (response && response.status_code === 200) {
        // 채팅방 페이지로 이동 (메시지 정보와 함께)
        navigate(`/chat/${roomId}`, {
          state: {
            chattingUserNickname: chattingUserNickname
          }
        });
      } else {
        // 닉네임만 전달
        navigate(`/chat/${roomId}`, {
          state: {
            chattingUserNickname
          }
        });
      }
    } catch (error) {
      console.error('채팅방 입장 중 오류:', error);
      // 오류 발생 시에도 닉네임 전달
      navigate(`/chat/${roomId}`, {
        state: {
          chattingUserNickname
        }
      });
    }
  };

  return (
    <li 
      className={`px-4 py-3 border-b hover:bg-gray-50 transition-colors relative ${isSelected ? 'bg-blue-50' : ''}`}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
      onClick={handleChatRoomEnter}
    >
      <div className="flex items-center space-x-4">
        {/* 프로필 이미지 (임시: 기본 아바타) */}
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-white font-bold">
            {chattingUserNickname ? chattingUserNickname[0] : '?'}
          </span>
        </div>

        {/* 채팅 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            {/* 상대방 닉네임 */}
            <h3 className="text-base font-medium text-gray-900 truncate">
              {chattingUserNickname || '알 수 없음'}
            </h3>

            {/* 마지막 메시지 시간 */}
            <span className="text-xs text-gray-500">
              {lastUpdatedAt ? formatRelativeTime(lastUpdatedAt) : ''}
            </span>
          </div>

          {/* 마지막 메시지와 상품 제목 */}
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600 truncate flex-1 mr-2">
              {lastMessage || '새로운 채팅이 시작되었습니다.'}
            </p>

            {/* 안 읽은 메시지 개수 */}
            {nonReadCount > 0 && (
              <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {nonReadCount}
              </div>
            )}
          </div>

          {/* 상품 제목 */}
          <p className="text-xs text-gray-500 mt-1 truncate">
            {postTitle || '알 수 없는 상품'}
          </p>
        </div>

        {/* 삭제 버튼 (선택된 경우에만 표시) */}
        {isSelected && (
          <button 
            onClick={handleDelete}
            className="absolute right-4 top-1/2 -translate-y-1/ text-black px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
          >
            삭제
          </button>
        )}
      </div>
    </li>
  );
};

export default ChatItem;
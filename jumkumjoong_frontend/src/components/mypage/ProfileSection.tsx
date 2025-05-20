// src/components/mypage/ProfileSection.tsx
import React from "react";
import star from "../../assets/icons/starFilled.svg";

interface ProfileSectionProps {
  username: string;
  rating: number;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  username,
  rating,
}) => {
  return (
    <div className="bg-white rounded-lg mt-4 p-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">{username}</div>
        <div className="flex items-center">
          <img src={star} alt="" className="w-6 h-6" />
          <span className="ml-1 text-lg font-bold">{rating.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;

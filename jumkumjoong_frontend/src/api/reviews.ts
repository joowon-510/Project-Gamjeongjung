import { axiosInstance } from "./axios";
// import { useAuthStore } from "../stores/useUserStore";

interface ReviewRegistProps {
  itemId: number;
  content: string;
  stars: number;
}

// 리뷰 생성
export const postReviewRegist = async (review: ReviewRegistProps) => {
  try {
    const response = await axiosInstance.post("/reviews", {
      itemId: review.itemId,
      content: review.content,
      stars: review.stars,
    });

    return response.data;
  } catch (error) {
    return null;
  }
};

// 리뷰 조회
export const getReview = async (sellerId: number) => {
  try {
    const response = await axiosInstance.get("/reviews", {
      params: {
        sellerId: sellerId,
      },
    });
    if (response.data.status_code === 200) {
      return response.data.body.content;
    }
    return [];
  } catch (error) {
    return null;
  }
};

export const getReviewStars = async () => {
  try {
    const response = await axiosInstance.get("/reviews/stars");

    return response;
  } catch (error) {
    return 0;
  }
};

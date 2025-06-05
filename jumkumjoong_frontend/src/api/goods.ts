// src/api/goods.ts
import { AxiosError } from "axios";
import { axiosInstance } from "./axios";
import { ItemEditParams, ItemRegistParams } from "../types/types";

// 상품 등록
export const postGoods = async (itemData: ItemRegistParams): Promise<any> => {
  try {
    const response = await axiosInstance.post("/items/regist-item", itemData);

    return response.data.body.itemId;
  } catch (error) {
    return null;
  }
};

// 상품 이미지 등록
export const postGoodsImage = async (
  imageFiles: File[],
  itemId: Number
): Promise<any> => {
  try {
    const formData = new FormData();
    // 이미지 파일들 추가
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    // JSON 객체를 string으로 변환 후 append
    formData.append(
      "imageUploadRequest",
      new Blob([JSON.stringify({ itemId })], {
        type: "application/json",
      })
    );

    const response = await axiosInstance.post("/items/upload", formData);
    return response.data?.body ? true : false;
  } catch (error) {
    return false;
  }
};

// 상품 상세 조회
export const getGoodsDetail = async (itemId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get("/items/item-info", {
      params: { itemId: itemId },
    });

    return response.data;
  } catch (error) {
    const e = error as AxiosError;
    if (e.response) {
      return e.response.data;
    }

    return null;
  }
};

// 상품 수정
export const postGoodsEdit = async (itemData: ItemEditParams): Promise<any> => {
  try {
    const response = await axiosInstance.post("/items/edit-item", itemData);

    return response;
  } catch (error) {
    return null;
  }
};

// 상품 삭제
export const deleteGoods = async (itemId: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete("/items/delete-item", {
      params: { itemId: itemId },
    });

    return response;
  } catch (error) {
    return null;
  }
};

// 상품 검색
export const getGoodsSearch = async (itemName: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/items/search-item`, {
      params: {
        itemName: itemName,
      },
    });

    if (response.data.status_code === 200) {
      return response.data.body;
    }
    return [];
  } catch (error) {
    return null;
  }
};

// 상품 상태 변경
export const postGoodsChangeStatus = async (
  itemId: number,
  status: boolean
): Promise<any> => {
  try {
    const response = await axiosInstance.patch(`/items/${itemId}/status`, {
      status: status,
    });

    return response;
  } catch (error) {
    return null;
  }
};

// 찜 목록 조회
export const getGoodsFavorites = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/items/wishlist");
    if (response.data.status_code === 200) {
      return response.data.body;
    }

    return [];
  } catch (error) {
    return [];
  }
};

// 찜 요청
export const postGoodsFavorites = async (itemId: number): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/items/save-item/${itemId}`);
    if (response.data.status_code === 200) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// 유저가 업로드한 상품 조회
export const getGoodsUsers = async (userId: number): Promise<any> => {
  try {
    const response = await axiosInstance.post("/items/item-list", {
      userId: userId,
    });
    if (response.data.status_code === 200 && response.data.body.length > 0) {
      return response.data.body;
    } else if (
      response.data.status_code === 200 &&
      response.data.body.length === 0
    ) {
      return [];
    }
  } catch (error) {
    return [];
  }
};

// 최근 상품 검색
export const getGoodsRecent = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/items/search-newItem");
    if (response.data.status_code === 200) {
      return response.data.body;
    }

    return false;
  } catch (error) {
    return false;
  }
};

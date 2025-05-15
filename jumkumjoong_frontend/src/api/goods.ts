// src/api/goods.ts
import { AxiosError } from "axios";
import { axiosInstance } from "./axios";
import { ItemEditParams, ItemRegistParams } from "../types/types";

// 상품 등록
export const postGoods = async (itemData: ItemRegistParams): Promise<any> => {
  try {
    const response = await axiosInstance.post("/items/regist-item", itemData);

    console.log("상품 등록: ", response);
    if (response.data.status_code === 200) {
      console.log("상품 등록 성공, 상세 페이지로 이동 필요");
    }
    return response.data.body;
  } catch (error) {
    console.log("상품 등록 실패: ", error);
    return null;
  }
};

// 상품 상세 조회
export const getGoodsDetail = async (itemId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get("/items/item-info", {
      params: { itemId: itemId },
    });

    console.log("상품 상세 조회: ", response);
    return response.data;
  } catch (error) {
    const e = error as AxiosError;
    console.log("상품 상세 조회 실패: ", e);
    if (e.response) {
      console.log("상품 상세 조회 실패 (서버 응답):", e.response.data);
      return e.response.data;
    } else {
      console.log("상품 상세 조회 실패 (네트워크 오류 또는 기타):", e.message);
    }

    return null;
  }
};

// 상품 수정
export const postGoodsEdit = async (itemData: ItemEditParams): Promise<any> => {
  try {
    const response = await axiosInstance.post("/items/edit-item", itemData);

    console.log("상품 수정: ", response);
    return response;
  } catch (error) {
    console.log("상품 수정 실패: ", error);
    return null;
  }
};

// 상품 삭제
export const deleteGoods = async (itemId: number): Promise<any> => {
  try {
    const response = await axiosInstance.delete("/items/delete-item", {
      params: { itemId: itemId },
    });

    console.log("상품 삭제: ", response);
    return response;
  } catch (error) {
    console.log("상품 삭제 실패: ", error);
    return null;
  }
};

// 상품 검색
// TODO: 한글 검색 지원 X, 백엔드 수정 중
export const getGoodsSearch = async (itemName: string): Promise<any> => {
  try {
    console.log("item Name: ", itemName);

    const response = await axiosInstance.get(`/items/search-item`, {
      params: {
        itemName: itemName,
      },
    });

    console.log("상품 검색: ", response);
    if (response.data.status_code === 200) {
      console.log("상품 검색 조회 성공");
      return response.data.body;
    }
    console.log("상품 검색 조회 실패: ", response.data.status_code);
    return [];
  } catch (error) {
    console.log("상품 검색 실패: ", error);
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

    console.log("상품 상태 변경: ", response);
    return response;
  } catch (error) {
    console.log("상품 상태 변경 실패: ", error);
    return null;
  }
};

// 찜 목록 조회
export const getGoodsFavorites = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/items/wishlist");
    if (response.data.status_code === 200) {
      console.log("찜한 목록 조회 성공: ", response.data.body);
      return response.data.body;
    }

    return [];
  } catch (error) {
    console.log("찜 목록 조회 실패: ", error);
    return [];
  }
};

// 찜 요청
export const postGoodsFavorites = async (itemId: number): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/items/save-item/${itemId}`);
    if (response.data.status_code === 200) {
      console.log("상품 찜 완료: ", response.data.body);
      return true;
    }
    return false;
  } catch (error) {
    console.log("상품 찜 실패: ", error);
    return false;
  }
};

// 유저가 업로드한 상품 조회
export const getGoodsUsers = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/items/item-list");
    if (response.data.status_code === 200 && response.data.body.length > 0) {
      console.log("유저가 올린 상품 목록 조회 성공: ", response);
      return response.data.body;
    } else if (
      response.data.status_code === 200 &&
      response.data.body.length === 0
    ) {
      console.log("유저가 올린 상품 목록 없음:", response);
      return [];
    }
  } catch (error) {
    console.log("유저가 올린 상품 목록 조회 실패: ", error);
    return [];
  }
};

// 최근 상품 검색
export const getGoodsRecent = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/items/search-newItem");
    if (response.data.status_code === 200) {
      console.log("최근 상품 조회 성공 : ", response.data.body);
      return response.data.body;
    }

    return false;
  } catch (error) {
    console.log("최근 상품 조회 실패: ", error);
    return false;
  }
};

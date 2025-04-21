export interface ItemRegistParams {
  userId: number;
  title: string;
  description: string;
  price: number;
  purchaseDate: string;
  grades: boolean;
  status: boolean;
  configuration: number;
  scratchesStatus: string;
}

export interface ItemsParams {
  userId: number;
  title: string;
  description: string;
  price: number;
  purchaseDate: string;
  grades: boolean;
  status: boolean;
  configuration: number;
  createdAt: string;
  scratchesStatus: string;
}

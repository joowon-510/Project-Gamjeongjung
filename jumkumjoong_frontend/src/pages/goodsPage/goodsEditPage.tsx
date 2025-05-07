import React from "react";
import { useParams } from "react-router-dom";

const GoodsEditPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  return <div>GoodsEditPage : {itemId}</div>;
};

export default GoodsEditPage;

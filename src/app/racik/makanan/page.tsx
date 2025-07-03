
"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";
import { ProductManager } from "@/components/product-management";

export default function MakananPage() {
    const { 
        foods, 
        rawMaterials, 
        addFood, 
        updateFood, 
        deleteFood 
    } = useAppContext();
    
    return (
        <ProductManager
            productType="makanan"
            products={foods}
            rawMaterials={rawMaterials}
            addProduct={addFood}
            updateProduct={updateFood}
            deleteProduct={deleteFood}
        />
    );
}

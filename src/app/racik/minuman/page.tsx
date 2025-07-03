
"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";
import { ProductManager } from "@/components/product-management";

export default function MinumanPage() {
    const { 
        drinks, 
        rawMaterials, 
        addDrink, 
        updateDrink, 
        deleteDrink 
    } = useAppContext();
    
    return (
        <ProductManager
            productType="minuman"
            products={drinks}
            rawMaterials={rawMaterials}
            addProduct={addDrink}
            updateProduct={updateDrink}
            deleteProduct={deleteDrink}
        />
    );
}

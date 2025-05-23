//components/Products.tsx

"use client";
import Card from '@/components/Card';
import Loading from "@/components/Loading";
import { fetchAllCollections } from '@/lib/features/products/productSlice';
import { useAppSelector } from '@/lib/hooks';
import { useAppDispatch } from '@/lib/store';
import React, { useEffect, useState } from 'react'
import { IoMdAddCircle } from "react-icons/io";
import { useDisclosure } from '@chakra-ui/react';
import AddProductModal from '@/components/AddProductModal';
import { Product } from '@/lib/types';
import Tab from './Tab';
import { CollectionData, Collection, category, subCategory } from '@/lib/collections';

type Category = "pooja" | "cosmetics" | "grocery" | "stationary";

export default function Products({ category }: { category: Category }) {
  const { loading, grocery, cosmetics, stationary, pooja } = useAppSelector(state => state.productReducer)
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useAppDispatch();

  const [subcategory, setSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<Category>(category);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Get current collection data
  const currentCollection = CollectionData.find(col => col.name.toLowerCase() === selectedCollection.toLowerCase());

  // Load all collections at once when component mounts
  useEffect(() => {
    dispatch(fetchAllCollections());
  }, [dispatch]);

  useEffect(() => {
    let products: Product[] = [];
    switch (selectedCollection) {
      case 'grocery':
        products = grocery;
        break;
      case 'cosmetics':
        products = cosmetics;
        break;
      case 'stationary':
        products = stationary;
        break;
      case 'pooja':
        products = pooja;
        break;
    }

    let filteredProducts = products;

    // Apply category/subcategory filter
    if (subcategory !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.subCategory === subcategory
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.subCategory?.toLowerCase().includes(query)
      );
    }

    // Apply additional filters
    if (selectedFilter) {
      switch (selectedFilter) {
        case "complete":
          filteredProducts = filteredProducts.filter(s => s.category && s.subCategory);
          break;
        case "no-cat":
          filteredProducts = filteredProducts.filter(s => !s.category && s.subCategory);
          break;
        case "no-subcat":
          filteredProducts = filteredProducts.filter(s => s.category && !s.subCategory);
          break;
        case "none":
          filteredProducts = filteredProducts.filter(s => !s.category && !s.subCategory);
          break;
      }
    }

    setFiltered(filteredProducts);
  }, [selectedCollection, subcategory, searchQuery, selectedFilter, grocery, cosmetics, stationary, pooja]);

  // Filtering logic based on button selection
  const handleFilter = (filterType: string) => {
    let filteredProducts: Product[];
    let products: Product[] = [];

    switch (selectedCollection) {
      case 'grocery':
        products = grocery;
        break;
      case 'cosmetics':
        products = cosmetics;
        break;
      case 'stationary':
        products = stationary;
        break;
      case 'pooja':
        products = pooja;
        break;
    }

    switch (filterType) {
      case "complete":
        filteredProducts = products.filter(s => s.category && s.subCategory);
        break;
      case "no-cat":
        filteredProducts = products.filter(s => !s.category && s.subCategory);
        break;
      case "no-subcat":
        filteredProducts = products.filter(s => s.category && !s.subCategory);
        break;
      case "none":
        filteredProducts = products.filter(s => !s.category && !s.subCategory);
        break;
      default:
        filteredProducts = products;
    }
    setFiltered(filteredProducts);
    setSelectedFilter(filterType);
  }

  return (
    <>
      {loading ? <div className="w-full h-screen">
        <Loading />
      </div> :
        <>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4 items-center">
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value as Category)}
                className="px-4 py-2 border rounded-md"
              >
                {CollectionData.map((col: Collection) => (
                  <option key={col.name} value={col.name.toLowerCase()}>
                    {col.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search by name, category, or subcategory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-md"
              />
            </div>
          </div>

          <Tab 
            subs={currentCollection?.categories.flatMap((cat: category) => cat.subCategories.map((sub: subCategory) => sub.name)) || []} 
            subcategory={subcategory} 
            setSubcategory={setSubcategory}
          />

          <div className='flex flex-row gap-10 mb-10'>
            <button
              className={`tooltip-container px-5 py-2 mx-5 w-50 rounded-md text-white font-semibold ${selectedFilter === 'complete' ? 'bg-black' : 'bg-green-400'}`}
              onClick={() => handleFilter('complete')}
            ><span className="tooltip-text">Filter Products with both Category and Subcategory</span>
              Complete
            </button>
            <button
              className={`tooltip-container px-5 py-2 mx-5 w-50 rounded-md text-white font-semibold ${selectedFilter === 'no-cat' ? 'bg-black' : 'bg-yellow-500'}`}
              onClick={() => handleFilter('no-cat')}
            ><span className="tooltip-text">Filter Products with no Category but Subcategory</span>
              no-cat
            </button>
            <button
              className={`tooltip-container px-5 py-2 mx-5 w-50 rounded-md text-white font-semibold ${selectedFilter === 'no-subcat' ? 'bg-black' : 'bg-orange-500'}`}
              onClick={() => handleFilter('no-subcat')}
            ><span className="tooltip-text">Filter Products with Category but no Subcategory</span>
              no-subcat
            </button>
            <button
              className={`tooltip-container px-5 py-2 mx-5 w-50 rounded-md text-white font-semibold ${selectedFilter === 'none' ? 'bg-black' : 'bg-red-500'}`}
              onClick={() => handleFilter('none')}
            ><span className="tooltip-text">Filter Products with Neither Category nor Subcategory</span>
              NONE!
            </button>
          </div>

          <div className='grid md:grid-cols-4 place-items-center'>
            {filtered.map((val: any) => <Card key={val.productId} details={val} category={selectedCollection} />)}
          </div>
        </>
      }
      <div className='fixed bottom-5 right-5'>
        <IoMdAddCircle className='text-4xl cursor-pointer' onClick={onOpen} />
      </div>
      <AddProductModal isOpen={isOpen} onClose={onClose} sub={selectedCollection} />
    </>
  )
}


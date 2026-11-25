"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  // Optional: You can persist this to localStorage if you want data to survive a page refresh
  // without re-fetching, though usually fetching on mount/login is safer.
  useEffect(() => {
    const storedCats = localStorage.getItem("categories");
    if (storedCats) {
      setCategories(JSON.parse(storedCats));
    }
  }, []);

  const updateCategories = (data) => {
    setCategories(data);
    localStorage.setItem("categories", JSON.stringify(data));
  };

  return (
    <CategoryContext.Provider value={{ categories, setCategories: updateCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);

"use client";

import { useState, useEffect } from "react"

export default function userProgressPage(){

const [modules, setModules] = useState([]);

const fetchModules = async () => {
  try {
    const res = await fetch('/api/modules');
    const data = await res.json();
    setModules(data);
    return data;
  } catch (err) {
    console.error('Failed to fetch modules:', err);
    return [];
  }
};

fetchModules;
console.log("modules", modules);


  return(
    <p>Page is displayed here</p>
  );
}

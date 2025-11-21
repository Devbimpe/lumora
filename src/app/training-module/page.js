"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";

const Module = ({ title, subtitle, bgColor, borderColor, href, icon }) => (
  <Link href={href} passHref>
    <div
      className={`p-6 ${bgColor} ${borderColor} border-2 cursor-pointer hover:bg-opacity-80 flex items-center transition duration-300 hover:scale-105 rounded-2xl shadow-lg hover:shadow-xl`}
    >
      {icon && (
        <img src={icon} alt={title} className="w-20 h-20 object-contain mr-5" />
      )}
      <div>
        <h2 className="text-xl font-bold text-green-700">{title}</h2>
        {subtitle && <p className="text-green-700 mt-1">{subtitle}</p>}
      </div>
    </div>
  </Link>
);

// Modified ModuleWrapper to display modules in a 2-column grid
const ModuleWrapper = ({ children, component: Component = 'div', ...props }) => (
  <Component
    className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto"
    {...props}
  >
    {children}
  </Component>
);

const TrainingModule = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      try {
        const response = await fetch("/api/modules");
        if (!response.ok) {
          throw new Error("Failed to fetch modules");
        }
        const data = await response.json();
        
        // Map API data to component format
        const formattedModules = data.map((module, index) => ({
          id: module.ModuleID,
          title: `MODULE ${module.ModuleID}: ${module.Heading}`,
          subtitle: module.Subheading || "",
          href: `/modules/module${module.ModuleID}`,
          icon: `/M${module.ModuleID}.jpg`,
          bgColor: index % 2 === 0 ? "bg-green-100" : "bg-orange-100",
        }));
        
        setModules(formattedModules);
      } catch (error) {
        console.error("Error fetching modules:", error);
        setModules([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchModules();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-5xl font-bold text-green-700 text-center my-6">THE TRAINING MODULES</h1>
      <p className="text-green-700 text-center mb-8 text-lg">
        Engage with interactive scenarios and group discussion designed to enhance critical thinking and decision-making.
      </p>
      {loading ? (
        <div className="text-center py-8 text-gray-600">
          Loading modules...
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No modules available
        </div>
      ) : (
        <ModuleWrapper>
          {modules.map((module) => (
            <Module
              key={module.id}
              title={module.title}
              subtitle={module.subtitle}
              bgColor={module.bgColor}
              borderColor="border-white"
              href={module.href}
              icon={module.icon}
            />
          ))}
        </ModuleWrapper>
      )}
    </div>
  );
};

export default TrainingModule;
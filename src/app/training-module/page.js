"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";

const Module = ({ title, subtitle, bgColor, borderColor, href, icon }) => (
  <Link href={href} passHref className="h-full block">
    <div
      // Align content to the top and allow long descriptions to wrap within the card.
      className={`p-4 sm:p-6 ${bgColor} ${borderColor} border-2 cursor-pointer hover:bg-opacity-80 flex flex-col sm:flex-row items-start transition duration-300 hover:scale-105 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl h-full`}
    >
      {icon && (
        <img src={icon} alt={title} className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3 sm:mb-0 sm:mr-5" />
      )}
      <div className="text-center sm:text-left flex-1 min-w-0">
        {/* Dark green module text to match the main header */}
        <h2 className="text-lg sm:text-xl font-bold text-green-700">{title}</h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-green-700 mt-1 whitespace-normal break-words">
            {subtitle}
          </p>
        )}
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
        
        // FILTER: Only keep modules where published is true
        // We filter BEFORE mapping so the index (used for bgColor) stays consistent (Green, Orange, Green...)
        const publishedModules = data.filter(module => module.published === true);

        // Map filtered data to component format — icon only from saved faviconURL (no fallback)
        const formattedModules = publishedModules.map((module, index) => ({
          id: module.ModuleID,
          title: `MODULE ${module.ModuleID}: ${module.Heading}`,
          subtitle: module.Subheading || "",
          href: `/modules/module${module.ModuleID}`,
          icon: module.faviconURL || null,
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 text-center my-4 sm:my-6">THE TRAINING MODULES</h1>
      <p className="text-green-700 text-center mb-6 sm:mb-8 text-base sm:text-lg px-4">
        Engage with interactive scenarios and group discussion designed to enhance critical thinking and decision-making.
      </p>
      {loading ? (
        <div className="text-center py-8 text-gray-600">
          Loading modules...
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No active modules available.
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

import React from "react";
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

const TrainingModule = () => (
  <div className="container mx-auto p-6 max-w-7xl">
    <h1 className="text-5xl font-bold text-green-700 text-center my-6">THE TRAINING MODULES</h1>
    <p className="text-green-700 text-center mb-8 text-lg">
      Engage with interactive scenarios and group discussion designed to enhance critical thinking and decision-making.
    </p>
    <ModuleWrapper>
      <Module 
        title="MODULE 1: Sustainability & Its Dimensions" 
        subtitle="Understanding sustainability and its three core dimensions in tech" 
        bgColor="bg-green-100" 
        borderColor="border-white" 
        href="/modules/module1" 
        icon="/M1.jpg" 
      />
      <Module 
        title="MODULE 2: Dimensions of Social Sustainability" 
        subtitle="Exploring equity, well-being, community, and long-term impact" 
        bgColor="bg-orange-100" 
        borderColor="border-white" 
        href="/modules/module2"
        icon="/M2.jpg" 
      />
      <Module 
        title="MODULE 3: Case Scenarios & Reflective Exercises" 
        subtitle="Apply your learning through realistic case studies" 
        bgColor="bg-green-100" 
        borderColor="border-white"
        href="/modules/module3" 
        icon="/M3.jpg" 
      />
    </ModuleWrapper>
  </div>
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
export default TrainingModule;
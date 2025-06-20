import React from "react";
import Link from "next/link";

const Module = ({ title, subtitle, bgColor, borderColor, href, icon }) => (
  <Link href={href} passHref>
    <div className={`p-4 ${bgColor} ${borderColor} border-4 mb-4 cursor-pointer hover:bg-opacity-90 flex items-center`}>
      {icon && (
        <img src={icon} alt={title} className="w-16 h-16 mb-2 object-contain mr-4" />
      )}
      <div>
        <h2 className="text-xl font-bold text-green-700">{title}</h2>
        {subtitle && <p className="text-green-700">{subtitle}</p>}
      </div>
    </div>
  </Link>
);

const TrainingModule = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold text-green-700 text-center my-4">THE TRAINING MODULES</h1>
    <p className="text-green-700 text-center mb-4">
      Engage with interactive scenarios and group discussion designed to enhance critical thinking and decision-making.
    </p>
   <Module 
    title="MODULE 1: What Is Sustainability" 
    subtitle="Introduction to sustainability and its relevance in tech" 
    bgColor="bg-green-100" 
    borderColor="border-white" 
    href="/modules/module1" 
    icon="/M1.jpg" 
/>
    <Module 
      title="MODULE 2: Dimensions of Sustainability" 
      subtitle="Environmental, economic, technical and social sustainability" 
      bgColor="bg-orange-100" 
      borderColor="border-white" 
      href="/modules/module2"
      icon="/M2.jpg" 
      />
    <Module 
    title="MODULE 3: Social Sustainability" 
    subtitle="Understanding the tech industry's social impact and ethical obligations" 
    bgColor="bg-green-100" 
    borderColor="border-white"
    href="/modules/module3" 
    icon="/M3.jpg" />
    <Module 
    title="MODULE 4: Environmental Impact"
    subtitle="Understanding environmental implications of software development" 
    bgColor="bg-orange-100" 
    borderColor="border-white"
    href="/modules/module4"
    icon="/M4.jpg"  />
    <Module 
    title="MODULE 5: Dimensions of Sustainability" 
    subtitle="Balancing economic factors with sustainable development practices" 
    bgColor="bg-green-100" 
    borderColor="border-white" 
    href="/modules/module5" 
    icon="/M5.jpg" />
    <Module 
    title="MODULE 6: Social Sustainability" 
    subtitle="Ethical considerations in technical decision-making processes" 
    bgColor="bg-orange-100" 
    borderColor="border-white"
     href="/modules/module6" 
     icon="/M6.jpg" />
    <Module 
    title="MODULE 7: Implementation Strategies" 
    subtitle="Practical approaches to implementing sustainable software practices" 
    bgColor="bg-green-100" 
    borderColor="border-white" 
    href="/modules/module7"
    icon="/M7.jpg" />
  </div>
);

export default TrainingModule;
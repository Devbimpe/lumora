import React from "react";
import Link from "next/link";
const Module = ({ title, subtitle, bgColor, borderColor, href }) => (
  <Link href={href} passHref>
    <div className={`p-4 ${bgColor} ${borderColor} border-4 mb-4 cursor-pointer hover:bg-opacity-90`}>
      <h2 className="text-xl font-bold text-green-700">{title}</h2>
      {subtitle && <p className="text-green-700">{subtitle}</p>}
    </div>
  </Link>
);

const TrainingModule = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold text-green-700 text-center my-4">THE TRAINING MODULES</h1>
    <p className="text-green-700 text-center mb-4">
      Engage with interactive scenarios and group discussion designed to enhance critical thinking and decision-making.
    </p>
    <Module title="MODULE 1: What Is Sustainability" bgColor="bg-green-100" borderColor="border-blue-500" href="/modules/module1"/>
    <Module title="MODULE 2: Dimensions of Sustainability" subtitle="Environmental, economic, technical and social sustainability" bgColor="bg-yellow-100" borderColor="border-blue-500" href="/module" />
    <Module title="MODULE 3: Social Sustainability" bgColor="bg-green-100" borderColor="border-blue-500" href="/module3" />
    <Module title="MODULE 4: Dimensions of Social Sustainability" bgColor="bg-yellow-100" borderColor="" />
    <Module title="MODULE 5: Dimensions of Sustainability" subtitle="Environmental, economic, technical and social sustainability" bgColor="bg-green-100" borderColor="" />
    <Module title="MODULE 6: Social Sustainability" bgColor="bg-yellow-100" borderColor="" />
    <Module title="MODULE 7: module 7: Implementation Strategies : Practical approaches to implementing sustainable software practices " bgColor="bg-green-100" borderColor="" />
  </div>
);

export default TrainingModule;

import Link from 'next/link';

export default function Sidebar({ activeSection }) {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin' },
    { id: 'user-management', label: 'User Management', path: '/admin/user-management' },
    { id: 'feedback', label: 'Feedback', path: '/admin/feedback' },
    { id: 'progress', label: 'Module Progress', path: '/admin/module-progress' },
    { id: 'management', label: 'Module Management', path: '/admin/module-management' },
  ];

  return (
    <div className="bg-[#f97316] flex flex-col w-1/7 min-h-screen m-10">
      {sections.map((section) => (
        <Link
          key={section.id}
          href={section.path}
          className={`text-2xl rounded m-2 py-2 text-center text-black hover:bg-[#ff9851] hover:scale-105 transition duration-300 ${
            activeSection === section.id ? 'bg-[#ff9851]' : ''
          }`}
        >
          {section.label}
        </Link>
      ))}
    </div>
  );
}
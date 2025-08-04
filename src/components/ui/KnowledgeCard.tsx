import React from 'react';
import Link from 'next/link';
// Bỏ import CustomButton nếu bạn chọn phương án này và nó không dùng ở đâu khác

interface KnowledgeCardProps {
  title: string;
  description: string;
  tags?: string[];
  href: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ 
  title, 
  description, 
  tags, 
  href, 
  gradientFrom = 'from-gray-700', 
  gradientTo = 'to-gray-800'
}) => {
  const gradientStyle = `bg-gradient-to-br ${gradientFrom} ${gradientTo}`;

  return (
    <div 
      className={`
        ${gradientStyle} 
        p-6 rounded-xl shadow-2xl 
        flex flex-col justify-between 
        h-full 
        hover:shadow-purple-400/30 transition-shadow duration-300
      `}
    >
      <div>
        <h3 className="text-2xl font-bold mb-3 text-slate-800">{title}</h3>
        <p className="text-slate-600 mb-4 text-sm leading-relaxed">
          {description}
        </p>
        {tags && tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Link 
                href={`/tags/${encodeURIComponent(tag.toLowerCase())}`} 
                key={index} 
                className="bg-white bg-opacity-10 text-xs font-semibold px-2.5 py-0.5 rounded-full hover:bg-opacity-20 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
      {/* PHẦN ĐÃ THAY ĐỔI CHO NÚT READ MORE */}
      <div className="mt-auto">
        <Link 
          href={href} 
          className="inline-block text-center w-full sm:w-auto font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-300 ease-in-out border border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white focus:ring-purple-300"
        >
          Read more
        </Link>
      </div>
    </div>
  );
};

export default KnowledgeCard;
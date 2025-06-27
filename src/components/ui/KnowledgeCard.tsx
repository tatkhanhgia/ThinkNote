import React from 'react';
import Link from 'next/link'; // Import Link
import CustomButton from './CustomButton';

interface KnowledgeCardProps {
  title: string;
  description: string;
  tags?: string[];
  href: string; // href giờ là bắt buộc và dùng cho Link
  gradientFrom?: string;
  gradientTo?: string;
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ 
  title, 
  description, 
  tags, 
  href, // Không còn giá trị mặc định, sẽ được truyền từ page
  gradientFrom = 'from-gray-700', 
  gradientTo = 'to-gray-800'
}) => {
  const gradientStyle = `bg-gradient-to-br ${gradientFrom} ${gradientTo}`;

  return (
    <div 
      className={`
        ${gradientStyle} 
        p-6 rounded-xl shadow-2xl 
        text-white 
        flex flex-col justify-between 
        h-full 
        hover:shadow-purple-400/30 transition-shadow duration-300
      `}
    >
      <div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
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
      <div className="mt-auto">
        <Link href={href} passHref legacyBehavior>
          <CustomButton 
            as="a" // Render CustomButton như một thẻ <a>
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-gray-800 w-full sm:w-auto"
          >
            Read more
          </CustomButton>
        </Link>
      </div>
    </div>
  );
};

export default KnowledgeCard;
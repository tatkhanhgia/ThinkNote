import React from 'react';

interface StatItem {
  label: string;
  value: number | string;
  color?: string; // Tailwind text-color class, e.g. 'text-blue-600'
}

interface PageHeaderProps {
  title: string;
  description?: string;
  stats?: StatItem[];
  gradient?: string; // Tailwind gradient classes
  children?: React.ReactNode; // Extra content below description (e.g. search input)
}

/**
 * Shared page header with gradient bg, title, optional description,
 * optional stats pill, and optional slot for extra content.
 * Used across Topics, Categories, Tags, and Search pages.
 */
export default function PageHeader({
  title,
  description,
  stats,
  gradient = 'from-blue-50 to-purple-50',
  children,
}: PageHeaderProps) {
  return (
    <section className={`bg-gradient-to-r ${gradient} py-16 sm:py-20`}>
      <div className="container mx-auto px-6 text-center">
        <h1 className="heading-xl text-gray-800 mb-6">{title}</h1>

        {description && (
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        )}

        {children}

        {stats && stats.length > 0 && (
          <div className="mt-10 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-6 text-center">
                {stats.map((stat, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="w-px h-8 bg-gray-300" />}
                    <div>
                      <div className={`text-2xl font-bold ${stat.color || 'text-blue-600'}`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

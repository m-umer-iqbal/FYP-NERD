import React, { useState } from 'react';
import FeatureItem from './FeatureItem';

function FeatureList({ features, onFeatureSelect }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="flex-1 flex flex-col gap-2 relative z-10 cursor-default">
      {features.map((item, index) => (
        <FeatureItem
          key={item.id}
          item={item}
          isHovered={hoveredId === item.id}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          index={index}
          onClick={() => onFeatureSelect && onFeatureSelect(item)}
        />
      ))}
    </div>
  );
}

export default FeatureList;
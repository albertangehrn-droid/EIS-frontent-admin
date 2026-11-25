import Image from 'next/image';

export function AvatarCirclePlayDemo({ initials, size = 'md', status = null, image = null }) {
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-sm' : size === 'sm' ? 'h-9 w-9 text-[11px]' : 'h-12 w-12 text-xs';
  
  // Status colors
  const statusColors = {
    adopter: 'bg-[#22c55e]',
    experiment: 'bg-blue-500',
    interest: 'bg-yellow-500',
    aware: 'bg-orange-500',
    unaware: 'bg-gray-300'
  };
  
  const statusColor = status ? statusColors[status] || 'bg-gray-300' : 'bg-gray-300';

  return (
    <div className="relative">
      {image ? (
        <div className={`relative ${sizeClass} rounded-full border border-gray-400 overflow-hidden shadow-sm`}>
          <Image
            src={image}
            alt={initials}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={`flex ${sizeClass} items-center justify-center rounded-full border border-gray-400 bg-gradient-to-b from-white to-gray-100 font-semibold text-gray-700 shadow-sm`}
        >
          {initials}
        </div>
      )}
      {status && (
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${statusColor} border-2 border-white`} />
      )}
    </div>
  );
}

export function PersonLabelPlayDemo({ name, title, center = false }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <div className="text-[15px] font-semibold text-[#222]">{name}</div>
      <div className="text-[12px] text-[#666]">{title}</div>
    </div>
  );
}

export function ChartPersonPlayDemo({ person, style, align = 'row', center = false, avatarSize = 'md', status = null, onHover, onLeave, image = null }) {
  const rowClass = align === 'column' ? 'flex-col' : 'flex-row';
  return (
    <div 
      className="absolute cursor-pointer"
      style={style}
      onMouseEnter={() => onHover && onHover(person)}
      onMouseLeave={() => onLeave && onLeave()}
    >
      <div className={`flex items-center gap-2 ${rowClass}`}>
        <AvatarCirclePlayDemo initials={person.initials} size={avatarSize} status={status} image={image} />
        <PersonLabelPlayDemo name={person.name} title={person.title} center={center} />
      </div>
    </div>
  );
}

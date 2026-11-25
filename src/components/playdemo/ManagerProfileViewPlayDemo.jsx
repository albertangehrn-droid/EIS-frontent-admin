import Image from 'next/image';
import IMAGES from '@/utils/imagePaths';

export default function ManagerProfileViewPlayDemo({ selectedManager }) {
  // Get the manager number from the image path
  const getManagerNumber = (imagePath) => {
    const match = imagePath?.match(/\/(\d+)\.(png|jpg)/);
    return match ? parseInt(match[1]) : 1;
  };

  const managerNumber = getManagerNumber(selectedManager.image);

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row bg-white overflow-hidden">
      
      {/* Top/Right side - Large Profile JPG Image */}
      <div className="w-full lg:w-2/5 h-[200px] sm:h-[300px] lg:h-full shrink-0 relative overflow-hidden bg-[#f5f5f5] order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-gray-300">
        <Image
          src={IMAGES.ALL.PROFILE_JPG[managerNumber]} // Replace with JPG image
          alt={selectedManager.name}
          fill
          className="object-contain lg:object-cover object-top"
        />
      </div>

      {/* Bottom/Left side - Manager Info */}
      <div className="w-full lg:w-3/5 flex-1 flex flex-col pt-4 lg:mt-[10px] pb-4 lg:mb-[10%] order-2 lg:order-1 overflow-y-auto">
        {/* Header with name and role */}
        <div className="px-4 lg:px-6 mb-3 lg:mb-4 text-center shrink-0">
          <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-serif text-[#111] mb-1">
            {selectedManager.name}
          </h2>

          <p className="text-sm sm:text-base lg:text-[16px] text-[#666] font-serif">
            ({selectedManager.role || 'Manager'})
          </p>
        </div>

        {/* Manager info */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-[27px] leading-relaxed text-[#333]">
          {selectedManager.description && (
            <p className="mb-4">
              {selectedManager.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

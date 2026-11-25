import { warningDialogData } from '@/data/demoSessionData';

export default function LaunchWarningDialogPlayDemo({ show, onClose }) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[400px] rounded-md overflow-hidden shadow-lg font-sans"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-white h-[32px]" />
        
        <div className="bg-[#9FB4CC] py-5 px-6 text-center">
          <p className="text-sm text-black mb-4 font-bold">
            {warningDialogData.message}
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-2 bg-white text-black border border-blue-500 hover:bg-[#6A8CB4] transition text-sm font-bold cursor-pointer"
            >
              {warningDialogData.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

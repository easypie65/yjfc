import React from 'react';

interface TrigTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRIG_TABLE_IMAGE_PATH = 'https://storage.googleapis.com/qvris-v1-files/276_%E1%84%89%E1%85%A1%E1%86%B7%E1%84%80%E1%85%A1%E1%86%A8%E1%84%87%E1%85%B5%E1%84%8B%E1%85%B4_%E1%84%91%E1%85%AD.png';

export const TrigTableModal: React.FC<TrigTableModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-3xl max-h-full overflow-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-800 py-2 px-2 flex justify-between items-center z-10">
            <h3 className="text-xl font-bold text-emerald-400">삼각비의 표</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>
        <div className="mt-2">
          <img 
            src={TRIG_TABLE_IMAGE_PATH} 
            alt="삼각비의 표"
            className="w-full h-auto rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

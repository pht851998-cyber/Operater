import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onClose }) => {
  return (
    <div className="mt-8 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
      <div className="relative bg-black aspect-video flex items-center justify-center">
        <video 
            src={videoUrl} 
            controls 
            autoPlay 
            loop 
            className="w-full h-full max-h-[600px] object-contain"
        />
      </div>
      
      <div className="p-4 flex flex-row items-center justify-between bg-gray-800 border-t border-gray-700">
        <button 
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Close Preview
        </button>
        
        <div className="flex gap-3">
          <a
            href={videoUrl}
            download="veo-generated-video.mp4"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary-900/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download MP4
          </a>
        </div>
      </div>
    </div>
  );
};
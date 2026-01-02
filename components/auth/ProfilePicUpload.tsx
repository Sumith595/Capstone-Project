
import React, { useState, useRef } from 'react';

interface ProfilePicUploadProps {
  onSubmit: (base64Image?: string) => void;
  onSkip: () => void;
}

const ProfilePicUpload: React.FC<ProfilePicUploadProps> = ({ onSubmit, onSkip }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageBase64(result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    onSubmit(imageBase64);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-center text-slate-100 mb-4">Add a Profile Picture</h2>
      <p className="text-slate-400 text-center mb-6">This helps personalize your experience.</p>
      
      <div className="w-40 h-40 rounded-full bg-slate-700 mb-6 flex items-center justify-center overflow-hidden border-4 border-slate-600 shadow-lg">
        {imagePreview ? (
          <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
        ) : (
          <svg className="w-20 h-20 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg"
      />

      <button
        onClick={handleUploadClick}
        className="w-full bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm transition-colors mb-4"
      >
        {imagePreview ? 'Change Picture' : 'Upload Picture'}
      </button>

      <div className="flex w-full space-x-4">
        <button
          onClick={onSkip}
          className="w-1/2 bg-transparent text-slate-400 font-semibold py-3 px-4 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={handleSubmit}
          className="w-1/2 bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg transition-transform transform hover:scale-105"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default ProfilePicUpload;
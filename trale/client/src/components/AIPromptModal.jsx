import React, { useEffect } from "react";

const AIPromptModal = ({ onClose, onGenerate, file, imagePreview }) => {
  useEffect(() => {
    if (file) {
      onGenerate(file); // Auto-generate once the modal opens and file exists
    }
  }, [file]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-4">Generating Caption with AI...</h3>
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Selected"
            className="w-48 h-48 object-cover rounded-md mb-4"
          />
        ) : (
          <p>No image selected</p>
        )}
        <button
          onClick={onClose}
          className="py-2 px-4 bg-gray-300 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AIPromptModal;

import Pica from 'pica';
import { jsPDF } from 'jspdf';
import { useSendToAPI } from '../../../../util/ApiHooks/index';

/**
 * UploadFileHelper - A custom hook for processing and uploading files. This upload runs only when the button it used, independent of all else
 * 
 * This hook provides functionality to process various file types (images, PDFs, .doc, .docx)
 * and upload them to a server. Images are resized and converted to PDF before uploading.
 * 
 * @param {string} fieldName - The name of the field in the form associated with this file upload.
 * @param {Function} setLocalFormData - A function to update the local form data with the uploaded file information.
 * 
 * @returns {Object} An object containing functions and state for file upload operations.
 * @property {Function} processAndUploadFile - Function to process and upload a file.
 * @property {boolean} uploadLoading - Indicates if an upload is in progress.
 * @property {string|null} uploadError - Error message if upload fails, null otherwise.
 * @property {Object|null} uploadResponse - Server response after successful upload, null if not uploaded.
 * @property {Function} uploadLoadingComponent - A React component to display during file upload.
 */
export const UploadFileHelper = (fieldName, setLocalFormData, isMultiple = false) => {
  const {
    sendRequest: sendUpload,
    loading: uploadLoading,
    error: uploadError,
    response: uploadResponse,
    LoadComponent: uploadLoadingComponent
  } = useSendToAPI('http://localhost:3000/api/forms/DiabetesManagement/uploadDocument', 'POST');

  const MAX_WIDTH = 1700;
  const MAX_HEIGHT = 2200;

    /**
   * Processes and uploads a file.
   * 
   * @param {File} file - The file to be processed and uploaded.
   * @param {string} fieldName - The name of the form field associated with this file.
   * @returns {Promise<void>}
   */
  const processAndUploadFile = async (file, fieldName) => {
    if (!file) return;

    try {
      let processedFile;
      let fileType = file.type;

      // // Determine file type and process
      if (file.type.startsWith('image/')) {
        // Process image files
        processedFile = await readFileAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // PDF files
        processedFile = await readFileAsDataURL(file);
      } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For .doc and .docx files, we'll just upload them as is
        processedFile = await readFileAsDataURL(file);
        fileType = file.type;
      } else {
        throw new Error('Unsupported file type');
      }

      // Prepare data for upload
      const dataToSend = {
        fileName: file.name,
        fileType: fileType,
        base64Data: processedFile,
        lastModified: file.lastModified,
      };

      // Upload the processed file
      const result = await sendUpload(dataToSend);
      console.log("result: ", result);

        // notify the parent component, set its state handle multiple uploads
        if (result) {
          setLocalFormData(prevData => {
            const newFileData = {
              key: result.minioResponse.key,
              url: result.minioResponse.viewUrl
            };

            if (isMultiple) {
              // For multiple file uploads
              return {
                ...prevData,
                [fieldName]: [...(prevData[fieldName] || []), newFileData]
              };
            } else {
              // For single file uploads
              return {
                ...prevData,
                [fieldName]: newFileData
              };
            }
          });
        }

    } catch (error) {
      console.error('Error processing or uploading file:', error);
      if (error.message === 'Unsupported file type') {
        // Notify the user about unsupported file type
        alert('Unsupported file type. Please upload an image, PDF, .doc, or .docx file.');
      } else {
        // Handle other errors (e.g., show error message to user)
        alert('An error occurred while processing or uploading the file. Please try again.');
      }
    }
  };

    /**
   * Processes an image file: resizes it and converts it to PDF.
   * 
   * @param {File} file - The image file to process.
   * @returns {Promise<string>} A promise that resolves with the base64-encoded PDF data.
   */
  const processImage = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const pica = new Pica();
        const canvas = document.createElement('canvas');
        
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        pica.resize(img, canvas, {
          unsharpAmount: 80,
          unsharpRadius: 0.6,
          unsharpThreshold: 2
        })
        .then(result => {
          // Convert to PDF
          const pdf = new jsPDF({
            orientation: result.width > result.height ? 'l' : 'p',
            unit: 'px',
            format: [result.width, result.height]
          });

          pdf.addImage(result, 'JPEG', 0, 0, result.width, result.height);
          const pdfBase64 = pdf.output('datauristring');
          resolve(pdfBase64);
        })
        .catch(reject);
      };

      img.onerror = () => reject(new Error('Error loading image'));
      
      img.src = URL.createObjectURL(file);
    });
  };

   /**
   * Reads a file and returns its contents as a data URL.
   * 
   * @param {File} file - The file to read.
   * @returns {Promise<string>} A promise that resolves with the file's data URL.
   */
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return { processAndUploadFile, uploadLoading, uploadError, uploadResponse, uploadLoadingComponent };
};
/**
 * Service to upload photos to ImgBB
 */

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

/**
 * Upload a check-in photo to ImgBB
 * @param staffId - Staff ID (used for naming/reference in logs if needed)
 * @param photoBlob - Photo blob from camera capture
 * @param type - 'checkin' or 'checkout'
 * @returns Download URL of uploaded photo from ImgBB
 */
export const uploadCheckInPhoto = async (
    _staffId: string,
    photoBlob: Blob,
    _type: 'checkin' | 'checkout'
): Promise<string> => {
    if (!IMGBB_API_KEY) {
        throw new Error('ImgBB API Key is not configured');
    }

    const formData = new FormData();
    formData.append('image', photoBlob);
    formData.append('key', IMGBB_API_KEY);

    try {
        const response = await fetch(IMGBB_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`ImgBB Upload Failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.data.url;
    } catch (error) {
        console.error('Error uploading to ImgBB:', error);
        throw error;
    }
};

/**
 * Convert base64 data URL to Blob
 */
export const dataURLtoBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

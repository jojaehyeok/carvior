// components/ImageUploader.tsx
import React, { useState } from 'react';
import { Button, Card, CardBody, CardFooter } from '@nextui-org/react';

interface ImageUploaderProps {
    label: string;
    maxImages: number;
    onImagesUploaded: (images: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, maxImages, onImagesUploaded }) => {
    const [images, setImages] = useState<File[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > maxImages) {
            alert(`You can only upload up to ${maxImages} images.`);
            return;
        }
        setImages([...images, ...files]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (onImagesUploaded) onImagesUploaded(images);
    };

    return (
        <div>
            <h4>{label}</h4>
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full mt-4 mb-4 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <input
                    id="dropzone-file"
                    className='hidden'
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ marginBottom: '1rem' }}
                />
            </label>
            <div className='grid grid-cols-4 gap-2'>
                {images.map((image, index) => (
                    <div key={index}>
                        <Card isHoverable>
                            <CardBody>
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Uploaded ${index}`}
                                />
                            </CardBody>
                            <CardFooter>
                                <Button onClick={() => handleRemoveImage(index)} size="sm" color="danger">
                                    Remove
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
            <Button onClick={handleSubmit} style={{ marginTop: '1rem' }}>
                Next
            </Button>
        </div>
    );
};

export default ImageUploader;

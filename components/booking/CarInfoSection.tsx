'use client';

import React from 'react';

interface CarInfoSectionProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export default function CarInfoSection({ formData, updateField, errors }: CarInfoSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">예약 정보</h2>
      
      {/* 차량 정보 */}
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">차량</p>
          <p className="font-semibold">
            {formData.carBrand} {formData.carModel} ({formData.carYear}) {formData.carType}
          </p>
        </div>
        
        {/* 차량 번호 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            차량 번호를 입력해주세요
          </label>
          <input
            type="text"
            value={formData.plateNumber}
            onChange={(e) => updateField('plateNumber', e.target.value)}
            placeholder="예: 12가 3456"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.plateNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.plateNumber}</p>
          )}
          
          {/* 신차 옵션 */}
          <div className="mt-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!formData.noPlateReason}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateField('noPlateReason', '신차라서 차량 번호가 없어요');
                    updateField('plateNumber', '');
                  } else {
                    updateField('noPlateReason', '');
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">신차라서 차량 번호가 없어요</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
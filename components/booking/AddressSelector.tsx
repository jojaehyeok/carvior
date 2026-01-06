'use client';

import React, { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';

// AddressSelector 수정
interface AddressSelectorProps {
  onAddressSelect?: (main: string, detail: string) => void;
  initialAddress?: string;
  initialDetail?: string;
}


export default function AddressSelector({ onAddressSelect }: AddressSelectorProps) {
  const [address, setAddress] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');
  const [isPostcodeOpen, setIsPostcodeOpen] = useState<boolean>(false);

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setAddress(fullAddress);
    setIsPostcodeOpen(false);
    
    if (onAddressSelect) {
      onAddressSelect(fullAddress, detailAddress);
    }
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDetailAddress(value);
    
    if (onAddressSelect && address) {
      onAddressSelect(address, value);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-900">
          평가장소 선택
        </label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={address}
            readOnly
            placeholder="평가받을 장소를 검색하세요"
            className="
              flex-1
              text-sm
              border border-gray-300 rounded-lg
              px-3 py-2
              bg-white
              cursor-pointer
              focus:outline-none
            "
            onClick={() => setIsPostcodeOpen(true)}
          />
          <button
            type="button"
            onClick={() => setIsPostcodeOpen(true)}
            className="
              whitespace-nowrap
              rounded-lg border border-gray-300
              bg-white
              px-3 py-2
              text-sm font-medium text-gray-800
              hover:border-black hover:bg-black hover:text-white
              transition
            "
          >
            검색
          </button>
        </div>
      </div>

      {address && (
        <div>
          <label className="block mb-1.5 text-sm font-medium text-gray-900">
            상세주소 (건물명, 동/호수)
          </label>
          <input
            type="text"
            value={detailAddress}
            onChange={handleDetailChange}
            placeholder="예: 101동 203호, B1층 주차장"
            className="
              w-full
              text-sm
              border border-gray-300 rounded-lg
              px-3 py-2
              focus:outline-none focus:ring-1 focus:ring-black
              bg-white
            "
          />
        </div>
      )}

      {isPostcodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-900">평가장소 검색</h3>
              <button
                onClick={() => setIsPostcodeOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <DaumPostcode
                onComplete={handleComplete}
                autoClose={false}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
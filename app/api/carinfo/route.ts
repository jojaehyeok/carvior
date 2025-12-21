import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://datahub-dev.scraping.co.kr/assist/common/carzen/CarAllInfoInquiry';
const API_TOKEN = '24166635b0e744d69cc91bb2ae520fe19abcec3e'; // 관리자만 알고 있는 API 토큰

export async function POST(request: NextRequest) {
  const { licensePlate, ownerName } = await request.json();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${API_TOKEN}`, // API 토큰을 요청 헤더에 포함합니다
      },
      body: JSON.stringify({
        REGINUMBER: licensePlate, // 여기에 REGINUMBER가 필요하다면 여기에 사용합니다
        OWNERNAME: ownerName,     // 여기에 OWNERNAME을 사용하여 API 요청을 보냅니다
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ errCode: '9999', errMsg: 'Internal Server Error' }, { status: 500 });
  }
}

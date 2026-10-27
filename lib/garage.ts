// 찜(장바구니)과 최근 본 차량 — 로그인 없이도 쓸 수 있어야 해서 브라우저에 저장한다.
// 서버에 안 올리므로 PC를 바꾸면 따라가지 않는다(나중에 계정에 묶으려면 여기만 고치면 된다).

const FAV_KEY = 'carvior_favorites';
const RECENT_KEY = 'carvior_recent';
const RECENT_MAX = 12;

export interface GarageCar {
  id: number;
  title: string;
  photo: string | null;
  price: number | null;
}

const read = (key: string): GarageCar[] => {
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    // 사생활 보호 모드 등에서 막힐 수 있다 — 기능이 없을 뿐 화면은 그대로 떠야 한다
    return [];
  }
};

const write = (key: string, list: GarageCar[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    // 같은 탭의 다른 컴포넌트(사이드 레일 등)도 바로 따라오게 알린다
    window.dispatchEvent(new Event('carvior-garage'));
  } catch {
    /* 저장이 막혀도 화면 동작은 막지 않는다 */
  }
};

export const getFavorites = () => read(FAV_KEY);
export const getRecent = () => read(RECENT_KEY);

export const isFavorite = (id: number) => getFavorites().some((c) => c.id === id);

export const toggleFavorite = (car: GarageCar): boolean => {
  const list = getFavorites();
  const exists = list.some((c) => c.id === car.id);
  write(FAV_KEY, exists ? list.filter((c) => c.id !== car.id) : [car, ...list]);
  return !exists; // 새로 담겼으면 true
};

export const removeFavorite = (id: number) => {
  write(FAV_KEY, getFavorites().filter((c) => c.id !== id));
};

// 본 차는 맨 앞으로 올리고, 너무 길어지지 않게 최근 12대만 남긴다
export const pushRecent = (car: GarageCar) => {
  const list = getRecent().filter((c) => c.id !== car.id);
  write(RECENT_KEY, [car, ...list].slice(0, RECENT_MAX));
};

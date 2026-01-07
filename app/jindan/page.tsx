import { title } from "@/components/primitives";
import CanvasWithText from "@/components/canvas"; // CanvasWithText를 import하세요
import JindanLayout from "./layout";

export default function JindanPage() {
  return (
    <div className="max-w-full max-h-screen flex flex-col items-center justify-center p-1 mt-10">
      <h1 className={title({color: 'violet'})}>모의 진단</h1>
      <div className="relative w-full max-w-screen-md aspect-w-16 aspect-h-9 mt-4">
        <CanvasWithText />
      </div>
    </div>

  );
}
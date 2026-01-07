// types/index.ts
import * as React from "react";

// SVG 전용
export interface IconSvgProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  width?: number;
  height?: number;
}

// IMG 전용
export interface IconImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
  width?: number;
  height?: number;
}

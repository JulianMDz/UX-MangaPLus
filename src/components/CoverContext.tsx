import { createContext, useContext } from "react";

// Datos listos para un <img>: Astro los genera en el build (WebP + varios anchos)
// y el padre .astro los pasa por props a las islas de React.
export interface OptimizedCover {
    src: string;
    srcSet: string;
    width: number;
    height: number;
}

export type CoverMap = Record<string, OptimizedCover>;

const CoverContext = createContext<CoverMap>({});

export const CoverProvider = CoverContext.Provider;
export const useCover = (name: string): OptimizedCover | undefined => useContext(CoverContext)[name];

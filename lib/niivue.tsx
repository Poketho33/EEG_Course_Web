'use client'

import { useRef, useEffect } from "react";
import { Niivue } from "@niivue/niivue";

export default function NiiVue({ imageUrl } : { imageUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nvRef = useRef<Niivue | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const volume = [{ url: imageUrl, colormap: 'hot', }];
    const mesh = [{ url: imageUrl, colormap: 'hot', }];
    const imageList = [...volume, ...mesh];

    const nv = new Niivue({
      isColorbar: true,
      backColor: [0.1, 0.1, 0.1, 1],
      onLocationChange: (location) => {
        console.log("Voxel Info:", location);
      }
    });

                      //     // 1. Get the active volume wrapper object
                      // const activeVolume = nv.volumes[0];

                      // // 2. Print metadata (dimensions, global min/max, voxel scaling factors)
                      // console.log("--- NII METADATA ---");
                      // console.log("Image Dimensions (Matrix):", activeVolume.hdr.dims); // e.g., [3, 256, 256, 256, 1...]
                      // console.log("File Data Min / Max:", activeVolume.calMin, activeVolume.calMax);
                      // console.log("Global Max Intensity:", activeVolume.globalMax);

                      // // 3. Look at the raw typed array buffer (Int16Array, Float32Array, etc.)
                      // console.log("Raw Voxel Array Length:", activeVolume.img.length);
    // nv.setSliceType(nv.sliceTypeRender);
    
    async function setupAndLoad() {
      try {
        nv.attachToCanvas(canvasRef.current!);
        await nv.loadImages(imageList);
        
        nvRef.current = nv; 
      } catch (error) {
        console.error("NiiVue failed to load the volume:", error);
      }
    }
    
    setupAndLoad();
  }, [imageUrl]);

  return (
    <canvas ref={canvasRef} height={480} width={640} />
  );
}
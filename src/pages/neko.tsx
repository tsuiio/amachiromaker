import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import saveAs from "file-saver";
import useWindowDimensions from "@/utils/hooks";
import { Psd } from "ag-psd";
import services from "@/utils/services";
import { Layer, LayerImage } from "@/types";
import consts from "@/utils/consts";
import mergeImages from "merge-images";

interface NekoProps {
  orderedLayers: Layer[] | undefined;
  layerComb: LayerImage[] | undefined;
  setLayerComb: Dispatch<SetStateAction<LayerImage[] | undefined>>;
}

const Neko = ({ orderedLayers, layerComb, setLayerComb }: NekoProps) => {
  const [outputImage, setOutputImage] = useState<string>();
  const [outputImageDimension, setOutputImageDimension] = useState<number>();
  const { width, height } = useWindowDimensions();

  const handleReset = () => {
    services.getDefaultCombination().then((res) => {
      setLayerComb(res);
      localStorage.setItem("layerComb", JSON.stringify(res));
    });
  };

  const handleDownloadPsd = async () => {
    const agPsd = await import("ag-psd");

    const psdLayers = await Promise.all(
      (layerComb || [])
        .map((i, idx) => ({
          ...i,
          name: orderedLayers?.[idx].pNm,
        }))
        .filter((i) => i.url)
        .map(async (layer) => {
          const drawImg = async (
            ctx: OffscreenCanvasRenderingContext2D | null,
            url: string
          ): Promise<string> => {
            if (!ctx) throw new Error("Canvas context is null.");

            return new Promise((resolve) => {
              const image = new Image();
              image.onload = function () {
                ctx.drawImage(image, 0, 0);
                resolve("resolved");
              };
              image.src = `${consts.CDN_PREFIX}${url}`;
            });
          };

          const canvas2 = new OffscreenCanvas(600, 600);
          const context = canvas2.getContext("2d");
          if (!context)
            throw new Error("Failed to get OffscreenCanvasRenderingContext2D.");

          await drawImg(context, layer.url);

          return {
            top: layer.y,
            left: layer.x,
            blendMode: "normal",
            opacity: 1,
            name: layer.name,
            canvas: canvas2,
          };
        })
    );

    const psdData: Psd = {
      width: 600,
      height: 600,
      colorMode: 3,
      channels: 3,
      bitsPerChannel: 8,
      children: psdLayers as never,
    };

    const data = agPsd.writePsd(psdData);
    const blob = new Blob([data]);
    saveAs(blob, `amachiromaker-output-${Date.now()}.psd`);
  };

  const handleDownloadPreset = () => {
    const presetJson = JSON.stringify(layerComb);
    const presetBlob = new Blob([presetJson], {
      type: "text/plain",
    });
    saveAs(presetBlob, `amachiromaker-preset-${Date.now()}.json`);
  };

  const handleLoadPreset = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result as string);
      localStorage.setItem("layerComb", reader.result as string);
      setLayerComb(data);
      // clear input file to allow user to select same file again
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const getOutputImageDimension = () => {
      // width and height are identical, so we only need width
      const maxWidth = 900;
      const minWidth = 400;
      const calculatedWidth = width > height ? width * 0.3 : width * 0.5;
      const finalWidth = Math.min(maxWidth, calculatedWidth);
      return finalWidth < minWidth ? minWidth : finalWidth;
    };

    setOutputImageDimension(getOutputImageDimension());
  }, [width, height]);

  useEffect(() => {
    const layerList =
      layerComb
        ?.filter((i) => i.url)
        ?.map((i) => ({
          src: `${consts.CDN_PREFIX}${i.url}`,
          x: i.x,
          y: i.y,
        })) || [];

    mergeImages(layerList).then((b64) => {
      setOutputImage(b64);
    });
  }, [layerComb]);

  return (
    <div
      className={`${
        width > height ? "flex-1" : ""
      } flex flex-col items-center text-center p-3`}
    >
      {outputImage?.startsWith("data:image/png;base64,") ? (
        <>
          <img
            className="rounded-2xl border-[#555] border-[3px] border-solid"
            width={outputImageDimension}
            src={outputImage}
            title="Output Image"
            alt="Output"
          />
          <div className="flex mt-4">
            <button
              type="button"
              className="bg-[#a1586d] hover:bg-[#fca4ce] rounded-lg text-white cursor-pointer text-sm
                    font-bold h-10 px-4 py-2 leading-normal text-center"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              type="button"
              className="ml-4 bg-[#fc7c73] hover:bg-[#fec8a9] rounded-lg h-10  text-white cursor-pointer text-sm
                    font-bold  px-4 py-2 leading-5 text-center touch-manipulation"
              onClick={() => {
                saveAs(
                  outputImage || "",
                  `amachiromaker-output-${Date.now()}.png`
                );
              }}
            >
              Save PNG
            </button>
            <button
              type="button"
              className="ml-4 bg-[#fc7c73] hover:bg-[#fec8a9] rounded-lg h-10  text-white cursor-pointer text-sm
                    font-bold px-4 py-2 leading-5 text-center touch-manipulation"
              onClick={handleDownloadPsd}
            >
              Save PSD
            </button>
          </div>
          <div className="relative flex mt-3">
            <label htmlFor="presetInput" className="sr-only">
              Choose Preset File
            </label>
            <input
              className="absolute collapse top-0 left-0 w-full h-full"
              id="presetInput"
              type="file"
              accept=".json"
              onChange={handleLoadPreset}
              aria-label="Load Preset File"
            />
            <button
              type="button"
              className="ml-4 bg-[#dd9785] rounded-lg border-none box-border text-white cursor-pointer text-sm 
                  font-bold h-10 leading-5 list-none outline-none px-4 py-2 text-center no-underline 
                  transition duration-200 align-baseline select-none touch-manipulation"
              onClick={() => {
                document.getElementById("presetInput")?.click();
              }}
            >
              Load Preset
            </button>
            <button
              type="button"
              className="ml-4 bg-[#fc7c73] hover:bg-[#fec8a9] rounded-lg h-10  text-white cursor-pointer text-sm
                    font-bold px-4 py-2 leading-5 text-center touch-manipulation"
              onClick={handleDownloadPreset}
            >
              Download Preset
            </button>
          </div>
        </>
      ) : (
        <div
          className="rounded-2xl border-solid border-[#555] flex flex-col text-center items-center justify-center text-gray-500"
          style={{
            width: outputImageDimension,
            height: outputImageDimension,
          }}
        >
          loading...
        </div>
      )}
    </div>
  );
};

export default Neko;

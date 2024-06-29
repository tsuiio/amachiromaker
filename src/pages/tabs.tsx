import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ConfigProvider, Tabs } from "antd";
import consts from "@/utils/consts";
import { Layer, LayerImage } from "@/types";
import useWindowDimensions from "@/utils/hooks";

interface CtabsProps {
  orderedLayers: Layer[] | undefined;
  layerComb: LayerImage[] | undefined;
  setLayerComb: Dispatch<SetStateAction<LayerImage[] | undefined>>;
}

const Ctabs = ({ orderedLayers, layerComb, setLayerComb }: CtabsProps) => {
  const [itemImageDimension, setItemImageDimension] = useState<number>();
  const [colorImageDimension, setColorImageDimension] = useState<number>();
  const [tabImageDimension, setTabImageDimension] = useState<number>();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const getItemImageDimension = () => {
      // width and height are identical, so we only need width
      const maxWidth = 160;
      const calculatedWidth = width > height ? width * 0.1 : width * 0.167;
      const finalWidth = Math.min(maxWidth, calculatedWidth);
      return finalWidth;
    };
    const getColorImageDimension = () => {
      // width and height are identical, so we only need width
      const maxWidth = 60;
      const calculatedWidth = width > height ? width * 0.05 : width * 0.083;
      const finalWidth = Math.min(maxWidth, calculatedWidth);
      return finalWidth;
    };
    const getTabImageDimension = () => {
      return getColorImageDimension();
    };

    setItemImageDimension(getItemImageDimension());
    setColorImageDimension(getColorImageDimension());
    setTabImageDimension(getTabImageDimension());
  }, [width, height]);

  const handleChangeItem = (
    layerIdx: number,
    itmId: number | undefined,
    cId: number | undefined,
    url: string | undefined
  ) => {
    const layerComb_ = [...(layerComb || [])];

    layerComb_[layerIdx] = {
      ...layerComb_[layerIdx],
      itmId: itmId as number,
      cId: cId as number,
      url: url as string,
    };

    localStorage.setItem("layerComb", JSON.stringify(layerComb_));

    setLayerComb(layerComb_);
  };

  const items = orderedLayers?.map((layer, idx) => ({
    key: idx.toString(),
    label: (
      <img
        className="rounded-lg max-w-none max-h-none"
        width={tabImageDimension}
        src={`${consts.CDN_PREFIX}${layer.thumbUrl}`}
        alt=""
      />
    ),
    children: (
      <div className="flex flex-col items-start justify-start text-center">
        <div className="rounded-2xl w-full border-[2px] border-dashed border-[#723939]">
          {!!layer.isRmv && (
            <img
              className={`
                ${
                  layerComb?.[idx]?.itmId === 0
                    ? "rounded-xl border-[3px] my-2 mx-1 inline-block object-contain border-solid duration-300 border-[#f0e982] cursor-default"
                    : "rounded-xl border-[3px] border-dashed my-2 mx-1 inline-block object-contain duration-200 border-[#3e3e8f] hover:bg-[#f082ac] cursor-pointer"
                } max-w-none h-[none]`}
              onClick={() => handleChangeItem(idx, 0, 0, "")}
              width={itemImageDimension}
              height={itemImageDimension}
              src="emptyset.svg"
              alt=""
            />
          )}
          {layer.items.map((item) => (
            <img
              key={item.itmId}
              className={`
               ${
                 layerComb?.[idx]?.itmId === item.itmId
                   ? "rounded-xl border-[3px] my-2 mx-1 inline-block object-contain border-solid duration-300 border-[#f0e982] cursor-default"
                   : "rounded-xl border-[3px] border-dashed my-2 mx-1 inline-block object-contain duration-200 border-[#3e3e8f] hover:bg-[#f082ac] cursor-pointer"
               }
                 max-w-none
              `}
              src={`${consts.CDN_PREFIX}${item.thumbUrl}`}
              width={itemImageDimension}
              height={itemImageDimension}
              onClick={() => {
                const sameColorItem = item.originals.find(
                  (orig) => orig.cId === layerComb?.[idx]?.cId
                );
                handleChangeItem(
                  idx,
                  item.itmId,
                  sameColorItem?.cId || item.originals[0].cId,
                  sameColorItem?.url || item.originals[0].url
                );
              }}
              alt=""
            />
          ))}
        </div>
        {!!(
          Object.keys(layer.colors).length > 1 && layerComb?.[idx]?.itmId
        ) && (
          <div className="rounded-2xl w-full mt-1 border-[2px] border-dashed border-[#2c5a2c]">
            {layer.items
              .find((item) => item.itmId === layerComb?.[idx]?.itmId)
              ?.originals.map((orig) => (
                <div
                  key={orig.cId}
                  className={
                    layerComb[idx]?.cId === orig.cId
                      ? "rounded-full my-2 mx-1 inline-block object-contain border-solid border-[4px] border-white cursor-default"
                      : "rounded-full my-2 mx-1 mr-1 inline-block object-contain border-solid border-[4px] border-gray-500 cursor-pointer duration-200 hover:border-[#f082ac]"
                  }
                  style={{
                    background: layer.colors[orig.cId],
                    width: colorImageDimension,
                    height: colorImageDimension,
                  }}
                  onClick={() =>
                    handleChangeItem(
                      idx,
                      layerComb[idx]?.itmId as number,
                      orig.cId,
                      orig.url
                    )
                  }
                />
              ))}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            cardPadding: "10px 10px",
            cardGutter: 0.8,
            colorBorder: "#f0e982",
            colorBgContainer: "#f0e982",
            lineType: "dashed",
            lineWidth: 2,
            padding: 5,
            margin: 10,
          },
        },
      }}
    >
      <div className={`${width > height ? "w-[60%]" : "w-screen"} h-full p-4`}>
        <Tabs
          defaultActiveKey="1"
          type="card"
          size="large"
          tabBarStyle={{}}
          items={items}
        />
      </div>
    </ConfigProvider>
  );
};

export default Ctabs;

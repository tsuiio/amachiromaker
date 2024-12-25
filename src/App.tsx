import { useEffect, useState } from "react";
import { Layer, LayerImage } from "@/types";
import services from "@/utils/services";
import Neko from "@/pages/neko";
import Ctabs from "@/pages/tabs";
import Layout from "@/pages/layout";
import "@/App.css";

function App() {
  const [layerComb, setLayerComb] = useState<LayerImage[]>();
  const [orderedLayers, setOrderedLayers] = useState<Layer[]>();
  const [loadingCount, setLoadingCount] = useState<number>(2);

  useEffect(() => {
    if (loadingCount === 0) {
      const loader = document.querySelector(".fullscreen-loader");
      if (loader) {
        setTimeout(() => {
          loader.remove();
        }, 800);
      }
    }
  }, [loadingCount]);

  useEffect(() => {
    const savedComb = JSON.parse(localStorage.getItem("layerComb") || "null");

    if (!savedComb) {
      services.getDefaultCombination().then((res) => {
        setLayerComb(res);
      });
    } else {
      setLayerComb(savedComb);
    }

    services.getOrderedLayers().then((res) => {
      setOrderedLayers(res);
    });

    setLoadingCount((c) => c - 1);
  }, []);

  return (
    <Layout>
      <Neko
        layerComb={layerComb}
        setLayerComb={setLayerComb}
        orderedLayers={undefined}
        setLoadingCount={setLoadingCount}
      />
      <Ctabs
        orderedLayers={orderedLayers}
        layerComb={layerComb}
        setLayerComb={setLayerComb}
      />
    </Layout>
  );
}

export default App;

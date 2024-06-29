export interface LayerImage {
  url: string;
  x: number;
  y: number;
  itmId: number;
  cId: number;
  name?: string;
}

export interface Layer {
  id: string | number | bigint | null | undefined;
  angle: number;
  canMv: number;
  colorCnt: number;
  colors: {
    [key: number]: string;
  };
  cpId: string;
  defItmId: number;
  isMX: number;
  isMY: number;
  isMenu: number;
  isRmv: number;
  isRota: number;
  isRsiz: number;
  items: {
    itmId: number;
    thumbUrl: string;
    typeId: number;
    originals: {
      cId: number;
      url: string;
    }[];
  }[];
  lyrs: number[];
  pId: number;
  pNm: string;
  pType: number;
  thumbUrl: string;
  x: number;
  y: number;
}

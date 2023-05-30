export type AllListings = {
    symbol: string;
    engName?: string;
    market: string;
    zhName?: string;
  };
  
  export type UsStockListData = {
    symbol: string;
    name: string;
    lastsale: string;
    netchange: number;
    pctchange: string;
    volume: number;
    marketCap: number;
    country: string;
    ipoyear: number;
    industry: string;
    sector: string;
    url: string;
  }[];
  
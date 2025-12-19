import React, { useEffect, useState } from "react";
import axios from "axios";

interface PriceData {
  [key: string]: {
    price: string;
  };
}

const OilTicker: React.FC = () => {
  const [prices, setPrices] = useState<PriceData>({});

  const fetchPrices = async () => {
    try {
      const res = await axios.get("/api/oil/prices");
      setPrices(res.data);
    } catch (err) {
      console.log("Failed to fetch oil prices");
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const items = Object.entries(prices);

  return (
    <div className="w-full overflow-hidden bg-black py-2">
      <div className="flex whitespace-nowrap gap-12 animate-ticker">

        {items.map(([symbol, data]) => (
          <div key={symbol} className="flex items-center gap-2 text-white font-semibold text-sm">
            <span className="text-blue-400">{symbol}:</span>
            <span>${data.price}</span>
          </div>
        ))}

        {items.map(([symbol, data]) => (
          <div key={symbol + "-copy"} className="flex items-center gap-2 text-white font-semibold text-sm">
            <span className="text-blue-400">{symbol}:</span>
            <span>${data.price}</span>
          </div>
        ))}

      </div>
    </div>
  );
};

export default OilTicker;

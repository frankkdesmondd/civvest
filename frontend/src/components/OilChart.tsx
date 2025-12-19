import React, { useEffect } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

const OilChart: React.FC = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          width: "100%",
          height: 400, // Reduced height for mobile
          symbol: "TVC:USOIL",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          container_id: "oil_chart_container",
          autosize: true, // Make it responsive
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      const container = document.getElementById("oil_chart_container");
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div className="mt-[1em] sm:mt-[2em]">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">
        Live Crude Oil Market Chart
      </h2>
      <div
        id="oil_chart_container"
        className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] w-full"
      ></div>
    </div>
  );
};

export default OilChart;
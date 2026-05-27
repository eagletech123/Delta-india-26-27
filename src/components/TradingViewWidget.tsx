import React, { memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  isDark: boolean;
}

function TradingViewWidget({ symbol, isDark }: TradingViewWidgetProps) {
  // Map selectedSymbol to Delta Exchange India TradingView ticker format
  let tvSymbol = "DELTAIN:BTCUSD.P";
  if (symbol.includes("ETH")) {
    tvSymbol = "DELTAIN:ETHUSD.P";
  } else if (symbol.includes("BTC")) {
    tvSymbol = "DELTAIN:BTCUSD.P";
  } else {
    // General fallbacks if needed
    tvSymbol = `DELTAIN:${symbol.replace("-PERP", "").replace("-", "")}.P`;
  }

  const themeStr = isDark ? "dark" : "light";
  
  // Construct native iframe widget url to avoid any dynamic script load blocks "Script error"
  const iframeSrc = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(tvSymbol)}&theme=${themeStr}&style=1&timezone=exchange&interval=15&locale=en&hidesidetoolbar=1&hidetoptoolbar=0&hidelegend=0&hidevolume=0&calendar=0&studies=[]&withdateranges=1`;

  return (
    <div 
      id="tradingview-widget-root-container"
      className="tradingview-widget-container h-full w-full select-none flex flex-col justify-between" 
      style={{ height: "400px", width: "100%" }}
    >
      <iframe
        id="tradingview-widget-iframe"
        title="TradingView advanced chart"
        src={iframeSrc}
        style={{ width: "100%", height: "calc(100% - 24px)", border: "none" }}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
      <div className="tradingview-widget-copyright text-[11px] text-center text-slate-500 font-mono select-none py-1">
        <a 
          id="tradingview-copyright-anchor"
          href={`https://www.tradingview.com/symbols/${tvSymbol.replace("DELTAIN:", "")}/?exchange=DELTAIN`} 
          rel="noopener nofollow" 
          target="_blank"
          className="hover:underline"
        >
          <span className="text-[#06b6d4] font-semibold">{tvSymbol} Live Price Chart</span>
        </a> by TradingView
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);

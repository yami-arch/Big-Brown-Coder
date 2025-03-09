"use client"

import { useState, useEffect } from "react"
import { Search } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

// Hardcoded data for Apple (AAPL)
const hardcodedData = {
  symbol: "AAPL",
  summary: {
    data: [
      {
        attributes: {
          last: 174.79,
          change: 1.22,
          percentChange: 0.7,
          marketCap: 2740000000000,
          volume: 54329800,
          fiftyTwoWeekLow: 124.17,
          fiftyTwoWeekHigh: 198.23,
          exchange: "NASDAQ"
        }
      }
    ]
  },
  profile: {
    data: [
      {
        attributes: {
          companyName: "Apple Inc.",
          exchange: "NASDAQ",
          sector: "Technology",
          industry: "Consumer Electronics",
          description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod."
        }
      }
    ]
  },
  financialsAnnual: [
    {
      title: "Revenues",
      rows: [
        {
          name: "total_revenue",
          cells: [
            { name: "FY 2020", raw_value: 274515000000 },
            { name: "FY 2021", raw_value: 365817000000 },
            { name: "FY 2022", raw_value: 394328000000 },
            { name: "FY 2023", raw_value: 383293000000 }
          ]
        }
      ]
    }
  ],
  financialsQuarterly: [
    {
      title: "Revenues",
      rows: [
        {
          name: "total_revenue",
          cells: [
            { name: "Q1 2023", raw_value: 117154000000 },
            { name: "Q2 2023", raw_value: 94836000000 },
            { name: "Q3 2023", raw_value: 81797000000 },
            { name: "Q4 2023", raw_value: 89498000000 }
          ]
        }
      ]
    }
  ],
  peers: {
    data: [
      {
        attributes: {
          companyName: "Microsoft Corporation",
          peRatioFwd: 32.5,
          marketCap: 2890000000000,
          roa: 14.2
        }
      },
      {
        attributes: {
          companyName: "Alphabet Inc.",
          peRatioFwd: 22.8,
          marketCap: 1720000000000,
          roa: 13.1
        }
      },
      {
        attributes: {
          companyName: "Amazon.com, Inc.",
          peRatioFwd: 40.3,
          marketCap: 1650000000000,
          roa: 5.2
        }
      },
      {
        attributes: {
          companyName: "Meta Platforms, Inc.",
          peRatioFwd: 24.1,
          marketCap: 980000000000,
          roa: 17.8
        }
      },
      {
        attributes: {
          companyName: "NVIDIA Corporation",
          peRatioFwd: 58.7,
          marketCap: 2250000000000,
          roa: 32.5
        }
      }
    ]
  },
  news: {
    data: [
      {
        attributes: {
          title: "Apple's AI Strategy: Balancing Innovation and Privacy",
          publishOn: "2024-10-15T14:30:00Z",
          slug: "/news/2024/10/15/apple-ai-strategy-balancing-innovation-privacy"
        }
      },
      {
        attributes: {
          title: "iPhone 16 Sales Exceed Expectations in First Month",
          publishOn: "2024-10-12T09:45:00Z",
          slug: "/news/2024/10/12/iphone-16-sales-exceed-expectations"
        }
      },
      {
        attributes: {
          title: "Apple's Services Revenue Hits New Record in Q4",
          publishOn: "2024-10-08T16:15:00Z",
          slug: "/news/2024/10/08/apple-services-revenue-hits-new-record"
        }
      },
      {
        attributes: {
          title: "Apple Expands Manufacturing in India, Reducing China Dependence",
          publishOn: "2024-10-05T11:20:00Z",
          slug: "/news/2024/10/05/apple-expands-manufacturing-india"
        }
      },
      {
        attributes: {
          title: "Analysts Project Strong Holiday Season for Apple Products",
          publishOn: "2024-10-01T13:40:00Z",
          slug: "/news/2024/10/01/analysts-project-strong-holiday-season-apple"
        }
      }
    ]
  },
  estimates: {
    data: [
      {
        attributes: {
          period_end_date: "2024-12-31T00:00:00Z",
          consensus: 123450000000
        }
      },
      {
        attributes: {
          period_end_date: "2025-03-31T00:00:00Z",
          consensus: 98760000000
        }
      },
      {
        attributes: {
          period_end_date: "2025-06-30T00:00:00Z",
          consensus: 84520000000
        }
      },
      {
        attributes: {
          period_end_date: "2025-09-30T00:00:00Z",
          consensus: 92340000000
        }
      }
    ]
  },
  ratings: {
    data: [
      {
        attributes: {
          averageRating: "Buy",
          targetPrice: 210.50
        }
      }
    ]
  },
  dividend: {
    data: [
      {
        attributes: {
          yield: 0.5,
          payoutRatio: 0.14,
          annualPayout: 0.92
        }
      }
    ]
  },
  ownership: {
    data: [
      {
        attributes: {
          institutionalOwnership: 0.73,
          insiderOwnership: 0.07
        }
      }
    ]
  }
};

// Currency mapping based on exchange
const exchangeToCurrency = {
  "NASDAQ": { code: "USD", symbol: "$" },
  "NYSE": { code: "USD", symbol: "$" },
  "LSE": { code: "GBP", symbol: "£" },
  "TSE": { code: "JPY", symbol: "¥" },
  // Add more as needed
};

export default function StockDashboard() {
    <AppSidebar element={setSelect} />
    
    const navigate = useNavigate();
    // Get symbol from route parameters or use default
    const { symbol: symbolParam } = useParams();
    const initialSymbol = symbolParam || "AAPL";
    
    const [symbol, setSymbol] = useState(initialSymbol);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
  
    const fetchData = async () => {
        setLoading(true);
        setTimeout(() => {
          // Always use AAPL data structure but with current symbol
          const modifiedData = {
            ...hardcodedData,
            symbol: symbol.toUpperCase(),
            profile: {
              data: [{
                attributes: {
                  ...hardcodedData.profile.data[0].attributes,
                  companyName: `${symbol.toUpperCase()} `, // Dynamic company name
                }
              }]
            }
          };
          setData(modifiedData);
          setLoading(false);
          
          // Update page title
          document.title = `StockVision - ${symbol.toUpperCase()}`;
        }, 1000);
      };
  
    // Fetch data when component loads or when symbol changes
    useEffect(() => {
      fetchData();
    }, []);
  
    // Reset the symbol state if the URL parameter changes
    useEffect(() => {
        document.title = `StockVision - ${symbol.toUpperCase()}`;
      }, [symbol]);
  
    const handleSubmit = (e) => {
        e.preventDefault();
        const processedSymbol = symbol.toUpperCase().trim();
        navigate(`/stockdashboard/${processedSymbol}`); // Update URL
        fetchData();
      };
  
    const getCurrency = () => {
      const exchange = data?.summary?.data?.[0]?.attributes?.exchange || "NASDAQ";
      return exchangeToCurrency[exchange] || { code: "USD", symbol: "$" };
    };
  
    const currency = data ? getCurrency() : { code: "USD", symbol: "$" };
  
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation bar */}
        <nav className="bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400"></span>
              </div>
              <form onSubmit={handleSubmit} className="flex items-center max-w-md w-full">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    className="bg-gray-100 dark:bg-gray-700 border-0 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Search"}
                </button>
              </form>
            </div>
          </div>
        </nav>
  
        {/* Main content */}
        <main className="container mx-auto px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              ))}
            </div>
          ) : !data ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Enter a symbol and click "Search" to see results.</p>
            </div>
          ) : (
            <>
              {/* Stock header */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {data.profile?.data?.[0]?.attributes?.companyName || symbol}
                    </h1>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                        {data.profile?.data?.[0]?.attributes?.exchange}: {symbol}
                      </span>
                      <span className="text-sm px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {data.profile?.data?.[0]?.attributes?.sector}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start lg:items-end">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {currency.symbol}{data.summary?.data?.[0]?.attributes?.last.toFixed(2) || 'N/A'}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                        data.summary?.data?.[0]?.attributes?.change < 0 
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" 
                          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}>
                        {data.summary?.data?.[0]?.attributes?.change > 0 ? '+' : ''}
                        {data.summary?.data?.[0]?.attributes?.change.toFixed(2) || 'N/A'} 
                        ({data.summary?.data?.[0]?.attributes?.percentChange.toFixed(2) || 'N/A'}%)
                      </span>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Today</span>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Tabs */}
              <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                  {["overview", "financials", "peers", "estimates"].map((tab) => (
                    <li key={tab} className="mr-2">
                      <button
                        onClick={() => setActiveTab(tab)}
                        className={`inline-block p-4 rounded-t-lg ${
                          activeTab === tab
                            ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
  
              {/* Tab content */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Price Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Price Information</h2>
                      <p className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                        {currency.symbol}{data.summary?.data?.[0]?.attributes?.last.toFixed(2) || 'N/A'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                          data.summary?.data?.[0]?.attributes?.change < 0 
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" 
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        }`}>
                          {data.summary?.data?.[0]?.attributes?.change > 0 ? '+' : ''}
                          {data.summary?.data?.[0]?.attributes?.change.toFixed(2) || 'N/A'} 
                          ({data.summary?.data?.[0]?.attributes?.percentChange.toFixed(2) || 'N/A'}%)
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Today</span>
                      </div>
                    </div>
                  </div>
  
                  {/* Company Overview */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Company Overview</h2>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {data.profile?.data?.[0]?.attributes?.companyName || symbol}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {data.profile?.data?.[0]?.attributes?.exchange}: {symbol}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {data.profile?.data?.[0]?.attributes?.sector} - {data.profile?.data?.[0]?.attributes?.industry}
                      </p>
                    </div>
                  </div>
  
                  {/* Market Data */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Market Data</h2>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Market Cap</dt>
                          <dd className="text-gray-900 dark:text-white font-medium">
                            {currency.symbol}{(data.summary?.data?.[0]?.attributes?.marketCap / 1e9).toFixed(2)}B
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Volume</dt>
                          <dd className="text-gray-900 dark:text-white font-medium">
                            {(data.summary?.data?.[0]?.attributes?.volume / 1e6).toFixed(2)}M
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500 dark:text-gray-400">52 Week Range</dt>
                          <dd className="text-gray-900 dark:text-white font-medium">
                            {currency.symbol}{data.summary?.data?.[0]?.attributes?.fiftyTwoWeekLow} - {currency.symbol}{data.summary?.data?.[0]?.attributes?.fiftyTwoWeekHigh}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}
  
              {activeTab === "financials" && (
                <div className="space-y-6">
                  {/* Annual Income Statement */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Annual Income Statement (Last 4 Years)
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <tr>
                              <th scope="col" className="px-6 py-3 rounded-l-lg">Year</th>
                              <th scope="col" className="px-6 py-3 rounded-r-lg">Total Revenue ({currency.code} M)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.financialsAnnual
                              .find((section) => section.title === "Revenues")
                              ?.rows.find((row) => row.name === "total_revenue")
                              ?.cells.slice(-4).reverse().map((cell, index) => (
                                <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    {cell.name.split(" ")[1] || cell.name}
                                  </td>
                                  <td className="px-6 py-4">
                                    {(cell.raw_value / 1e6).toFixed(2) || "N/A"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
  
                  {/* Quarterly Income Statement */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Quarterly Income Statement (Last 4 Quarters)
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <tr>
                              <th scope="col" className="px-6 py-3 rounded-l-lg">Quarter</th>
                              <th scope="col" className="px-6 py-3 rounded-r-lg">Total Revenue ({currency.code} M)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.financialsQuarterly
                              .find((section) => section.title === "Revenues")
                              ?.rows.find((row) => row.name === "total_revenue")
                              ?.cells.slice(-4).reverse().map((cell, index) => (
                                <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    {cell.name.split(" ")[1] || cell.name}
                                  </td>
                                  <td className="px-6 py-4">
                                    {(cell.raw_value / 1e6).toFixed(2) || "N/A"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
  
              {activeTab === "peers" && (
                <div className="space-y-6">
                  {/* Peer Comparison */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Peer Comparison</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <tr>
                              <th scope="col" className="px-6 py-3">Peer Company</th>
                              <th scope="col" className="px-6 py-3">P/E Ratio</th>
                              <th scope="col" className="px-6 py-3">Market Cap ({currency.code} B)</th>
                              <th scope="col" className="px-6 py-3">ROA %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.peers?.data.slice(0, 5).map((peer, index) => (
                              <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                  {peer.attributes.companyName.slice(0, 20)}
                                </td>
                                <td className="px-6 py-4">{peer.attributes.peRatioFwd ?? "N/A"}</td>
                                <td className="px-6 py-4">
                                  {peer.attributes.marketCap ? (peer.attributes.marketCap / 1e9).toFixed(2) : "N/A"}
                                </td>
                                <td className="px-6 py-4">{peer.attributes.roa ?? "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
  
                  {/* Latest News */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Latest News</h2>
                      {data.news?.data && data.news.data.length > 0 ? (
                        <div className="space-y-4">
                          {data.news.data.map((item, index) => (
                            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
                                  {item.attributes.publishOn?.slice(0, 10) || "N/A"}
                                </span>
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white mb-2">
                                {item.attributes.title || "N/A"}
                              </p>
                              <a
                                href={item.attributes.slug ? `https://seekingalpha.com${item.attributes.slug}` : "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-blue-600 hover:underline dark:text-blue-400 ${!item.attributes.slug ? "pointer-events-none text-gray-400 dark:text-gray-500" : ""}`}
                              >
                                {item.attributes.slug ? "Read More" : "Link Unavailable"}
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No news available for {symbol}.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
  
              {activeTab === "estimates" && (
                <div className="space-y-6">
                  {/* Revenue Estimates */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Revenue Estimates - Next 4 Quarters
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                          <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <tr>
                              <th scope="col" className="px-6 py-3 rounded-l-lg">Quarter End Date</th>
                              <th scope="col" className="px-6 py-3 rounded-r-lg">Consensus Estimate ({currency.code} M)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.estimates?.data.slice(-4).map((estimate, index) => (
                              <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                  {estimate.attributes.period_end_date?.slice(0, 10) || "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                  {estimate.attributes.consensus ? (estimate.attributes.consensus / 1e6).toFixed(2) : "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
  
                  {/* Analyst Ratings */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Analyst Ratings</h2>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {data.ratings?.data?.[0]?.attributes?.averageRating || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Average Target Price: {currency.symbol}
                            {data.ratings?.data?.[0]?.attributes?.targetPrice?.toFixed(2) || "N/A"}
                          </p>
                        </div>
                        <button
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm focus:ring-4 focus:ring-blue-300"
                        >
                          View All Ratings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    );
  }
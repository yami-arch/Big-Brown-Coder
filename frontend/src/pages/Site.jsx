import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_ENDPOINT = "http://localhost:5000/screen";

export default function Site({ele}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const exampleQueries = [
        "Find stocks with P/E ratio less than 18 and dividend yield greater than 2%",
        "Show me tech companies with market cap over 1 million and positive earnings growth",
        "Find stocks with ROIC greater than 25% and earnings yield above 15%"
    ];

    const searchStocks = async () => {
        if (!query.trim()) {
            setError("Please enter a search query");
            setResults(null);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_ENDPOINT}?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.error) {
                setError(data.error);
                setResults(null);
            } else {
                // Process the results to ensure each stock has a symbol property
                if (data.results && Array.isArray(data.results)) {
                    data.results = data.results.map(stock => {
                        // Make sure each stock has a valid symbol property
                        if (!stock.symbol && stock.ticker) {
                            stock.symbol = stock.ticker;
                        }
                        return stock;
                    });
                }
                setResults(data);
            }
        } catch (err) {
            setError("Error connecting to the API: " + err.message);
        }
        setLoading(false);
    };

    const navigateToStockDashboard = (stock) => {
        // If stock is a string, use it directly
        if (typeof stock === 'string') {
            if (stock && stock.trim()) {
                return;
            }
        } 
        // If stock is an object, extract the symbol
        else if (stock && typeof stock === 'object') {
            const symbol = stock.Name || stock.ticker;
            if (symbol && typeof symbol === 'string' && symbol.trim()) {
                navigate(`/stockdashboard/${symbol.trim()}`);
                return;
            }
        }
        
        // If we got here, we couldn't find a valid symbol
        setError("Invalid stock symbol. Please try another stock.");
    };

    return (
        <div className="max-w-6xl mx-auto p-8 bg-slate-50 shadow-xl rounded-xl border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Stock Screener</h1>
            <p className="text-slate-600 mb-6 italic">Enter your criteria in natural language to find matching stocks.</p>
            
            <div className="flex mb-6 shadow-md">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Example: Find tech stocks with P/E ratio under 20 and dividend yield above 2%"
                    className="flex-1 p-4 border-2 border-slate-300 focus:border-blue-500 rounded-l-lg focus:outline-none text-slate-700"
                    onKeyPress={(e) => e.key === "Enter" && searchStocks()}
                />
                <button
                    onClick={searchStocks}
                    className="bg-indigo-600 text-white px-6 py-4 rounded-r-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                    Search
                </button>
            </div>

            <div className="mb-8 bg-slate-100 p-4 rounded-lg">
                <p className="text-slate-700 font-medium mb-2">Try these examples:</p>
                <div className="flex gap-3 mt-2 flex-wrap">
                    {exampleQueries.map((ex, idx) => (
                        <button
                            key={idx}
                            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm hover:bg-indigo-200 transition-colors border border-indigo-200"
                            onClick={() => setQuery(ex)}
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <div className="text-center text-slate-600 py-10">
                <div className="animate-pulse flex justify-center items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                </div>
                <p className="mt-2 font-medium">Searching for matching stocks...</p>
            </div>}
            
            {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border-l-4 border-red-500 shadow-sm">{error}</div>}

            {results && (
                <div>
                    <div className="bg-indigo-50 p-6 rounded-lg mb-6 border border-indigo-100 shadow-sm">
                        <p className="mb-2"><span className="font-semibold text-indigo-800">Query:</span> <span className="text-slate-700">{results.query}</span></p>
                        <p className="mb-2"><span className="font-semibold text-indigo-800">Interpreted as:</span> <span className="text-slate-700">{results.extracted_criteria}</span></p>
                        <p><span className="font-semibold text-indigo-800">Matching stocks:</span> <span className="text-slate-700">{results.count}</span></p>
                    </div>
                    {results.count > 0 ? (
                        <div className="overflow-x-auto shadow-lg rounded-lg">
                            <table className="w-full border-collapse bg-white">
                                <thead>
                                    <tr className="bg-slate-800 text-white">
                                        <th className="px-6 py-3 text-left">Symbol</th>
                                        {Object.keys(results.results[0])
                                            .filter(key => key !== 'symbol' && key !== 'ticker')
                                            .map((header, index) => (
                                                <th key={index} className="px-6 py-3 text-left">
                                                    {header.replace(/_/g, ' ')}
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.results.map((stock, index) => (
                                        <tr 
                                            key={index} 
                                            className="hover:bg-slate-50 border-b border-slate-200 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <button
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                                                    onClick={() => {
                                                        
                                                        ele('/stockdashboard');
                                                        navigateToStockDashboard(stock)}}
                                                >
                                                    {stock.Name || stock.ticker || 'N/A'}
                                                </button>
                                            </td>
                                            {Object.keys(stock)
                                                .filter(key => key !== 'symbol' && key !== 'ticker')
                                                .map((key, idx) => (
                                                    <td 
                                                        key={idx} 
                                                        className="px-6 py-4 cursor-pointer"
                                                        onClick={() => navigateToStockDashboard(stock)}
                                                    >
                                                        {stock[key] !== undefined && stock[key] !== null ? stock[key] : '-'}
                                                    </td>
                                                ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center text-slate-600 py-10 bg-white rounded-lg shadow">No stocks matched your criteria.</div>
                    )}
                </div>
            )}
        </div>
    );
}
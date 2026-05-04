import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const Insights = ({ token }) => {
  const [trending, setTrending] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingPairs, setLoadingPairs] = useState(false);

  const fetchTrendingAnalytics = async () => {
    if (!token) return;
    setLoadingTrending(true);
    try {
      const res = await axios.get(`${backendUrl}/api/recommendations/analytics/trending`, {
        headers: { token }
      });
      if (res.data.success) {
        setTrending(res.data.trending);
        setTotalOrders(res.data.totalOrders);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load trending data');
    }
    setLoadingTrending(false);
  };

  const fetchCoPurchaseAnalytics = async () => {
    if (!token) return;
    setLoadingPairs(true);
    try {
      const res = await axios.get(`${backendUrl}/api/recommendations/analytics/copurchase`, {
        headers: { token }
      });
      if (res.data.success) {
        setPairs(res.data.pairs);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load co-purchase data');
    }
    setLoadingPairs(false);
  };

  useEffect(() => {
    fetchTrendingAnalytics();
    fetchCoPurchaseAnalytics();
  }, [token]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">Recommendation Insights</h2>
        <p className="text-sm text-gray-400">Data-driven analytics from the last 30 days of orders</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-primary/10 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Orders (30 days)</p>
          <p className="text-3xl font-bold text-primary">{totalOrders}</p>
        </div>
        <div className="bg-white border border-primary/10 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Trending Products</p>
          <p className="text-3xl font-bold text-primary">{trending.length}</p>
        </div>
        <div className="bg-white border border-primary/10 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Co-purchase Pairs</p>
          <p className="text-3xl font-bold text-primary">{pairs.length}</p>
        </div>
      </div>

      {/* Trending Products Table */}
      <div className="bg-white border border-primary/10 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-primary/10">
          <h3 className="text-lg font-semibold text-gray-700">Trending Products</h3>
          <p className="text-xs text-gray-400 mt-0.5">Ranked by total units ordered in the past 30 days</p>
        </div>
        {loadingTrending ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : trending.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            No order data available yet. Trending will populate as orders come in.
          </div>
        ) : (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-primary/5 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Units Ordered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trending.map(({ product, orderCount }, index) => (
                <tr key={index} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">#{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                        />
                      )}
                      <span className="font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{product.category} / {product.subCategory}</td>
                  <td className="px-6 py-4 font-medium">{currency}{product.price}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                      {orderCount} units
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Co-purchase Pairs Table */}
      <div className="bg-white border border-primary/10 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-primary/10">
          <h3 className="text-lg font-semibold text-gray-700">Frequently Bought Together</h3>
          <p className="text-xs text-gray-400 mt-0.5">Product pairs most commonly ordered in the same transaction</p>
        </div>
        {loadingPairs ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : pairs.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            No co-purchase data yet. Pairs will appear once customers order multiple items together.
          </div>
        ) : (
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-primary/5 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Product A</th>
                <th className="px-6 py-3 text-center text-gray-400">+</th>
                <th className="px-6 py-3 text-left">Product B</th>
                <th className="px-6 py-3 text-left">Times Paired</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pairs.map(({ product1, product2, count }, index) => (
                <tr key={index} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">#{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {product1.images?.[0] && (
                        <img
                          src={product1.images[0]}
                          alt={product1.name}
                          className="w-8 h-8 object-cover rounded-md border border-gray-100"
                        />
                      )}
                      <span className="line-clamp-1 max-w-[150px]">{product1.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300 font-bold text-lg">+</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {product2.images?.[0] && (
                        <img
                          src={product2.images[0]}
                          alt={product2.name}
                          className="w-8 h-8 object-cover rounded-md border border-gray-100"
                        />
                      )}
                      <span className="line-clamp-1 max-w-[150px]">{product2.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      {count}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Insights;

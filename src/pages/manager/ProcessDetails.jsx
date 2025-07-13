import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import axios from "axios";

const ProcessDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [processData, setProcessData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.get("http://localhost:8080/api/process/shared", {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        setProcessData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Filter data based on search term
    const filtered = processData.filter((row) =>
      row.process.toLowerCase().includes(value.toLowerCase()) ||
      row.side.toLowerCase().includes(value.toLowerCase()) ||
      row.operator.toLowerCase().includes(value.toLowerCase()) ||
      row.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div className="w-[90%] max-w-none mx-auto">
      {/* Search bar */}
      <div className="flex justify-center items-center mb-4 mt-14">
        <div className="relative w-full max-w-[600px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full h-10 pl-10 pr-4 rounded-2xl bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        All Processes
      </h2>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Process
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Side
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Operator
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Cutting Tool Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                    Machine Counter
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                      {row.process}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                      {row.side}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                      {row.operator}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                      {row.cuttingToolAmount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                      {row.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                      {row.mcounter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No processes found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessDetails;

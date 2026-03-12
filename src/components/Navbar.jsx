import React, { useState } from 'react';

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md gap-8">
            {/* Left Section: Logo and Title */}
            <div className="flex items-center gap-6 flex-1">
                {/* Logo Circle */}
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                    Step into the World Where Dialogue Reigns.
                </h2>
            </div>

            {/* Search Bar */}
            <div className="flex items-center flex-1 max-w-sm bg-gray-100 rounded-lg px-3 py-2 gap-2">
                <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-sm"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <button className="text-lg text-gray-600 hover:text-black transition-colors">
                    🔍
                </button>
            </div>

            {/* Right Section: Login */}
            <div className="flex items-center flex-shrink-0">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors">
                    Login
                </button>
            </div>
        </nav>
    );
}

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react';

interface PaginationProps {
    darkMode: boolean;
    page: number;
    setPage: (page: number | ((p: number) => number)) => void;
    pageSize: number | 'all';
    setPageSize: (size: number | 'all') => void;
    currentItemsCount: number;
}

const Pagination: React.FC<PaginationProps> = ({
    darkMode,
    page,
    setPage,
    pageSize,
    setPageSize,
    currentItemsCount
}) => {
    return (
        <div className={`mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                <span className={`text-sm font-medium pl-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sayfa Boyutu:</span>
                <div className="relative">
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            const val = e.target.value;
                            setPageSize(val === 'all' ? 'all' : Number(val));
                            setPage(1);
                        }}
                        className={`appearance-none pl-4 pr-8 py-1.5 text-sm font-bold rounded-md outline-none cursor-pointer transition-colors ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value="all">Hepsi</option>
                    </select>
                    <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className={`p-2 rounded-lg transition-all ${page === 1 ? 'opacity-30 cursor-not-allowed text-gray-400' : darkMode ? 'text-gray-400 hover:text-white hover:bg-slate-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
                    title="İlk Sayfa"
                >
                    <ChevronsLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`p-2 rounded-lg transition-all ${page === 1 ? 'opacity-30 cursor-not-allowed text-gray-400' : darkMode ? 'text-gray-400 hover:text-white hover:bg-slate-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
                    title="Önceki Sayfa"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className={`px-4 py-2 rounded-lg font-bold min-w-[3rem] text-center ${darkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>{page}</div>

                <button
                    onClick={() => setPage((p: number) => p + 1)}
                    disabled={pageSize === 'all' || currentItemsCount < (pageSize as number)}
                    className={`p-2 rounded-lg transition-all ${(pageSize === 'all' || currentItemsCount < (pageSize as number)) ? 'opacity-30 cursor-not-allowed text-gray-400' : darkMode ? 'text-gray-400 hover:text-white hover:bg-slate-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
                    title="Sonraki Sayfa"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;

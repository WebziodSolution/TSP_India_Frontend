const PaginationComponent = ({ currentPage, totalPages, setCurrentPage, handlePageClick }) => {
    return (
        <div className="px-4">
            <nav
                className="flex flex-row flex-nowrap justify-between md:justify-center items-center"
                aria-label="Pagination"
            >
                {/* Previous Page Button */}
                <button
                    className={`flex w-10 h-10 mr-1 justify-center items-center rounded-full border border-gray-200 bg-white text-black hover:border-gray-300
                        ${currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    title="Previous Page"
                >
                    <span className="sr-only">Previous Page</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="block w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>
                </button>

                {/* Page Buttons */}
                {[...Array(Math.max(totalPages || 1, 1))].map((_, index) => (
                    <button
                        key={index}
                        className={`w-10 h-10 mx-1 flex justify-center items-center rounded-full border ${currentPage === index ? "bg-blue-600 text-white hover:border-gray-300" : "border-gray-200 cursor-pointer"}`}
                        onClick={() => handlePageClick(index)}
                    >
                        {index + 1}
                    </button>
                ))}


                {/* Next Page Button */}
                <button
                    className={`flex w-10 h-10 ml-1 justify-center items-center rounded-full border border-gray-200 bg-white text-black hover:border-gray-300
                        ${totalPages === currentPage + 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={totalPages === currentPage + 1}
                    title="Next Page"
                >
                    <span className="sr-only">Next Page</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="block w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </button>
            </nav>
        </div>
    );
};

export default PaginationComponent;

import React from 'react'
import { connect } from 'react-redux'

const Loading = ({loading}) => {
    if (!loading) return null; 
    return (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-25 z-50 flex justify-center items-center">
            <div
                role="status"
                className="flex justify-center items-center space-x-2"
            >
                <svg className="h-20 w-20 animate-spin stroke-[#666cff]" viewBox="0 0 256 256">
                    <line
                        x1={128}
                        y1={32}
                        x2={128}
                        y2={64}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={24}
                    />
                    <line
                        x1="195.9"
                        y1="60.1"
                        x2="173.3"
                        y2="82.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={24}
                    />
                    <line
                        x1={224}
                        y1={128}
                        x2={192}
                        y2={128}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={24}
                    ></line>
                    <line
                        x1="195.9"
                        y1="195.9"
                        x2="173.3"
                        y2="173.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={24}
                    />
                    <line
                        x1={128}
                        y1={224}
                        x2={128}
                        y2={192}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={24}
                    ></line>
                    <line
                        x1="60.1"
                        y1="195.9"
                        x2="82.7"
                        y2="173.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={24}
                    />
                    <line
                        x1={32}
                        y1={128}
                        x2={64}
                        y2={128}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={24}
                    />
                    <line
                        x1="60.1"
                        y1="60.1"
                        x2="82.7"
                        y2="82.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={24}
                    ></line>
                </svg>
                <span className="text-4xl font-medium text-[#666cff]">Loading...</span>
            </div>
        </div>
    )
}
const mapStateToProps = (state) => ({
    loading: state.common.loading,
});

export default connect(mapStateToProps)(Loading);
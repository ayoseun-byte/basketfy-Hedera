
import React, { useState, useEffect } from 'react';
import {

    Share2,

} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';



const SuccessPage = ({ darkMode }) => {
    const location = useLocation(); // Hook to access location object
    const navigate = useNavigate(); // For navigating back or to explore
    const [basketDetails, setBasketDetails] = useState(null); // State to hold the received basket payload

    useEffect(() => {
        // Check if location.state exists and contains basketPayload
        if (location.state && location.state.basketPayload) {
            setBasketDetails(location.state.basketPayload);
        } else {
            // If no data is passed, redirect to a safe page (e.g., explore)
            console.warn("No basket payload found in navigation state. Redirecting to explore.");
            navigate('/explore');
        }
    }, [location.state, navigate]); // Depend on location.state and navigate

    const handleShare = () => {
        // Implement share logic (e.g., copy URL or open share dialog)
        if (basketDetails?.address) {
            const shareUrl = ""// `${window.location.origin}/basket/${basketDetails.address}`; // Example URL
            navigator.clipboard.writeText(shareUrl)
                .then(() => alert('Basket link copied to clipboard!'))
                .catch(err => console.error('Failed to copy text: ', err));
        }
    };
    return (<div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center justify-center`}>
        <div className={`max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-xl text-center`}>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
            <p className="text-lg mb-6">You now own the <span className="font-semibold text-purple-400">{basketDetails?.basketData.basketName}</span>!</p>

            <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>

                 <div className="mb-2" >
                                        <img
                                            src={basketDetails?.basketData.image || 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png'}
                                            alt="Basket"
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://i.ibb.co/7J52Ldr7/basket-svgrepo-com.png';
                                            }}
                                        />
                                    </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>bToken Balance:</span>
                        <span className="font-medium">{(parseFloat(basketDetails?.investmentAmount || '0') * 0.95).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Basket NFT:</span>
                        <span className="font-medium">1 NFT</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => navigate('/my-baskets')} // Go to portfolio page
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                    View Portfolio
                </button>
                <button
                    onClick={() => navigate('/explore')} // Go to explore page
                    className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} font-medium py-3 px-6 rounded-lg transition-colors`}
                >
                    Explore More Baskets
                </button>
                <button
                    className={`w-full flex items-center justify-center gap-2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} py-2 transition-colors`}
                >
                    <Share2 className="w-4 h-4" />
                    Share on X
                </button>
            </div>
        </div>
    </div>

    )
};

export default SuccessPage;
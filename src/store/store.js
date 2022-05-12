import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import walletReducer from '../slice/walletSlice'
// import nftReducer from '../slice/nftSlice'

export default configureStore({
    reducer: {
        wallet: walletReducer,
        // nft: nftReducer
    },
    middleware: [...getDefaultMiddleware({ serializableCheck: false })]
})
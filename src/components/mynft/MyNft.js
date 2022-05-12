import React, { useEffect, useState } from 'react'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import './slide.css';
import './loading.css';
import * as query from '../../contract/query'
import LoadingComponent from '../loading/LoadingComponent';
import axios from 'axios'

import { useWallet, WalletStatus, useConnectedWallet } from '@terra-money/wallet-provider';

const responsive = {
    superLargeDesktop: {
        // the naming can be any, depends on you.
        breakpoint: { max: 4000, min: 3000 },
        items: 1
    },
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 1
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1
    }
};
// const myNfts = [
//     {
//         path: '0.png'
//     },
//     {
//         path: '1.png'
//     },
//     {
//         path: '2.png'
//     },
//     {
//         path: '3.png'
//     },
//     {
//         path: '4.png'
//     }
// ]
const MyNft = (props) => {
    const {
        status,
        network,
        wallets,
        availableConnectTypes,
        availableInstallTypes,
        availableConnections,
        supportFeatures,
        connect,
        install,
        disconnect,
    } = useWallet();
    // const [loading, setLoading] = useState(false)

    const connectedWallet = useConnectedWallet()

    // useEffect(async () => {
    //     if (connectedWallet !== undefined) {
    //         await init()
    //     }
    //     // await init()
    // }, [connectedWallet])
    // useEffect(() => )


    return (
        <div>
            {/* {
                loading &&
                <LoadingComponent color='#00ff00' type='spinningBubbles' />
            } */}
            {
                status == 'WALLET_CONNECTED' &&
                <div className='carousel-section'>
                    <Carousel responsive={responsive} >
                        {
                            props.myNfts.length > 0 ?
                                props.myNfts.map((item, index) => (
                                    // <NftItem
                                    //     path={item.image}
                                    //     // name={item.name}
                                    //     // trait={item.attributes}
                                    //     key={index}
                                    // />
                                    <img src={item.image} alt={item.image} key={index} className='slide-img' />
                                )) : (
                                    <h1>There isn't any NFTs.</h1>
                                )
                        }
                    </Carousel>
                    {/* {
                        wallet && myMetadatas.length == 0 &&
                    } */}
                </div>
            }

        </div>
    )
}

export default MyNft
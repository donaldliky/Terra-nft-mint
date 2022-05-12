import React, { useState, useEffect } from 'react';
import './header.scss'

import { useDispatch, useSelector } from 'react-redux'
import { useWallet, WalletStatus } from '@terra-money/wallet-provider';
import { setConnection } from '../../slice/walletSlice';

import { Button } from '@mui/material'

const Header = (props) => {
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
    const dispatch = useDispatch()
    const [address, setAddress] = useState('')
    const truncate = (text = "", [h, t] = [6, 6]) => {
        const head = text.slice(0, h);
        const tail = text.slice(-1 * t, text.length);
        return text.length > h + t ? [head, tail].join("...") : text;
    };

    const connectType = 'EXTENSION'

    // console.log(status)
    const onClickConnect = async () => {
        connect(connectType)
        // console.log(status)
        // if (status == 'WALLET_CONNECTED') {
        //     // console.log('address', wallets[0].terraAddress)
        //     const account = wallets[0].terraAddress
        //     const connected = true
        //     // console.log(address)
        //     dispatch(setConnection({ account, connected }))
        // }
    }
    useEffect(() => {
        disconnect()
        props.setLoading(false)
    }, [])
    useEffect(() => {
        if (status == 'WALLET_CONNECTED') {
            setAddress(wallets[0].terraAddress)
            // props.setLoading(true)
            // console.log('address', wallets[0].terraAddress)
            // const account = wallets[0].terraAddress
            // const connected = true
            // console.log(address)
            // dispatch(setConnection({ account, connected }))

        }
    }, [status])

    return (
        <div className='header-body'>
            {/* <section>
                <pre>
                    {JSON.stringify(
                        {
                            status,
                            network,
                            wallets,
                            supportFeatures: Array.from(supportFeatures),
                            availableConnectTypes,
                            availableInstallTypes,
                        },
                        null,
                        2,
                    )}
                </pre>
            </section> */}
            {status === WalletStatus.WALLET_CONNECTED ? (
                <Button
                    variant="contained"
                    color='secondary'
                    sx={{
                        // bgcolor: '#4527a0',
                        color: 'white'
                    }}
                    onClick={() => disconnect()}
                >
                    {truncate(address)}
                </Button>
            ) : (
                <Button
                    variant="contained"
                    color='secondary'
                    sx={{
                        // bgcolor: '#4527a0',
                        color: 'white'
                    }}
                    onClick={async () => await onClickConnect()}
                >
                    CONNECT&nbsp;WALLET
                </Button>
            )
            }
        </div>
    )
}

export default Header
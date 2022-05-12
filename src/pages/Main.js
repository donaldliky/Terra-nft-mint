import React, { useState, useEffect } from 'react';
import MyNft from '../components/mynft/MyNft';
import Header from '../components/header/Header'
import './main.scss'

import { useWallet, WalletStatus, useConnectedWallet } from '@terra-money/wallet-provider';
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from 'axios'

import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Input from '@mui/material/Input';
import TextField from '@mui/material/TextField';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Icon from '@mui/material/Icon';

import * as execute from '../contract/execute'
import * as query from '../contract/query'

import LoadingComponent from '../components/loading/LoadingComponent';
// icons
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#2b303b',
    border: '2px solid #1f232a',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
    borderRadius: '15px',
    color: '#fffff2',
    // height: '90vh'
};

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const Main = () => {
    const [open, setOpen] = React.useState(false);

    const [file, setFile] = useState({})
    const [fileUrl, setFileUrl] = useState(null);
    const [image, setImage] = useState('')
    const [mintNum, setMintNum] = useState(1)
    const [loading, setLoading] = useState(false)
    const [connected, setConnected] = useState(false)
    const [myNfts, setMyNfts] = useState([])

    const [alertState, setAlertState] = useState({
        open: false,
        message: "",
        severity: undefined,
    });
    const { vertical, horizontal } = { vertical: 'top', horizontal: 'center' };

    const {
        status,
        network,
        wallets,
        availableConnectTypes,
        availableInstallTypes,
        availableConnections,
        supportFeatures,
        connect,
        disconnect,
    } = useWallet();

    const connectType = 'EXTENSION'

    const modalOpen = () => {
        if (status !== 'WALLET_CONNECTED') {
            setAlertState({
                open: true,
                message: `Connect your wallet!`,
                severity: 'warning',
            });
            return
        }
        setOpen(true)
    };


    const onChange = (event) => {
        const file = event.target.files[0]
        if (event.target.files && event.target.files[0]) {
            setImage(URL.createObjectURL(event.target.files[0]));
        }
        setFile(file)
    }

    const modalClose = () => {
        setOpen(false)
        setFile(null)
        setImage('')
    }
    const onClickSign = (increaseNum) => {
        if ((mintNum + increaseNum) < 1) {
            return
        }
        setMintNum(mintNum + increaseNum)
    }
    const connectedWallet = useConnectedWallet()

    const onMint = async () => {
        if (!(mintNum > 0)) {
            alert('type mint num correctly.')
        }
        setLoading(true)
        console.log('mint started')

        const tokenUri = await pinToIpfs()
        if (tokenUri === null) {
            setAlertState({
                open: true,
                message: `Uploading files failed. Try again!`,
                severity: 'error',
            });
            return
        }
        // for (let i = 0; i < mintNum; i++) {
        const response = await execute.mint(connectedWallet, tokenUri, mintNum)
        if (response == 'UserDenied') {
            setAlertState({
                open: true,
                message: `You denied transaction!`,
                severity: 'error',
            });
            setLoading(false)
            return
        }

        if (response == 'CreateTxFailed') {
            setAlertState({
                open: true,
                message: `CreateTxFailed!`,
                severity: 'error',
            });
            setLoading(false)
            return
        }
        if (response.code === 4) {
            setAlertState({
                open: true,
                message: `Unauthorized account!`,
                severity: 'error',
            });
            setLoading(false)
            return
        }

        if (response.code !== 0) {
            const error_message = response.raw_log
            // if (error_message.raw_log === "failed to execute message; message index: 0: Unauthorized: execute wasm contract failed") {
            //     console.log(error_message.raw_log)
            //     setAlertState({
            //         open: true,
            //         message: `Unauthorized account!`,
            //         severity: 'error',
            //     });
            //     setLoading(false)
            //     return
            // }

            switch (true) {
                case error_message.indexOf('token_id already claimed') !== -1:
                    // setError('Token ID Already Claimed.')
                    console.log("error: ", 'Token ID Already Claimed.')
                    setAlertState({
                        open: true,
                        message: `Token ID Already Claimed.`,
                        severity: 'error',
                    });
                    break
                case error_message.indexOf('addr_validate errored') !== -1:
                    // setError('Owner Address Not Valid.')
                    console.log("error: ", 'Owner Address Not Valid.')
                    setAlertState({
                        open: true,
                        message: `Owner Address Not Valid.`,
                        severity: 'error',
                    });
                    break

                default:
                    // setError(`${response.raw_log}.`)
                    console.log('error: ', typeof response.raw_log)
                    setAlertState({
                        open: true,
                        message: `${response.raw_log}`,
                        severity: 'error',
                    });
            }
            setLoading(false)

            // setOpen(true)
            // setUpdating(false)
            return
        }
        // }
        console.log('minting ended')
        await init()
        console.log('refreshing ended')
        modalClose()
        setLoading(false)
        console.log('mint ended')
        setAlertState({
            open: true,
            message: `Congratulations! Your ${mintNum} mints succeeded!`,
            severity: 'success',
        });

    }

    async function pinToIpfs() {
        // const { name, description, price, airdropAmount, maxSupply, category } = formInput;
        // if (!name || !description || !price || !category || maxSupply === 0) {
        //     errorAlert('please fill form data')
        //     return
        // }

        let url
        try {
            const added = await client.add(file, {
                progress: (prog) => console.log(`received: ${prog}`),
            });
            url = `https://ipfs.infura.io/ipfs/${added.path}`;
            console.log('url=============', url)
        } catch (error) {
            console.log("Error uploading file: ", error);
            return null
        }

        const data = JSON.stringify({
            // name,
            // description,
            image: url,
            // airdropAmount: airdropAmount,
            // maxSupply: maxSupply,
            // category,
        });

        try {
            const added = await client.add(data);
            const tokenURI = `https://ipfs.infura.io/ipfs/${added.path}`;
            console.log('tokenURI==========', tokenURI)
            return tokenURI
            /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
            // await createToken(tokenURI, airdropAmount, maxSupply, price);
        } catch (error) {
            console.log("Error uploading file: ", error);

            return null
        }
    }

    const init = async () => {
        // console.log('connectedWallet', connectedWallet)
        if (connectedWallet !== undefined) {
            let jsonURIs = []
            let imageURIs = []
            const myTokenIds = await query.tokens(connectedWallet)
            console.log('my tokens: ', myTokenIds)
            if (!(myTokenIds.tokens.length > 0)) {
                return
            }
            // console.log('my tokenUris: ', myTokenURIs)

            for (let i = 0; i < myTokenIds.tokens.length; i++) {
                let id = myTokenIds.tokens[i]
                let nft = await query.nft_info(connectedWallet, id)
                jsonURIs.push(nft.token_uri)
                console.log('nft: ', nft)
                // console.log('nft: ', nft)
                // lettempJson = await axios.get(nft.token_uri)
                await axios
                    .get(nft.token_uri)
                    .then((res) => {
                        console.log(res.data)
                        imageURIs.push(res.data)
                    })
                    .catch((e) => {
                        console.log(e)
                    })
            }

            setMyNfts(imageURIs)
            console.log('images: ', imageURIs)
        }
    }
    useEffect(async () => {
        if (status == 'WALLET_NOT_CONNECTED') {
            setMyNfts([])
        }
        if (status == 'WALLET_CONNECTED') {
            setLoading(true)
            await init()
            setLoading(false)
        }
    }, [status])

    useEffect(async () => {
        // console.log('init')
        // await disconnect()
        if (status == 'WALLET_CONNECTED') {
            disconnect()
        }
    }, [])

    return (
        <div>

            <div className='main-body'>
                <Header setLoading={setLoading} />
                <div className='main-container'>
                    {
                        status == 'WALLET_CONNECTED' ? (
                            <h1>My NFTs</h1>
                        ) : (
                            <h1>Connect your wallet!</h1>
                        )
                    }
                    <MyNft setLoading={setLoading} myNfts={myNfts} />

                    <Button color='secondary' variant='contained' onClick={modalOpen} sx={{ width: '200px', mt: 3 }}>
                        Mint
                    </Button>
                    <Modal
                        open={open}
                    // sx={{ maxHeight: '90vh', }}
                    >
                        <Box sx={style} style={{
                            display: 'flex', flexDirection: 'column', boxSizing: 'border-box', maxHeight: '700px',
                            height: image ? '90vh' : 'auto'
                        }}>
                            <div className='cross' onClick={modalClose}>
                                &times;
                            </div>
                            <h2 style={{ flexGrow: 0 }}>Mint Your NFT</h2>

                            <Button
                                variant="contained"
                                component="label"
                                color='secondary'
                                sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
                                style={{ flexGrow: 0 }}
                            >
                                Select your image
                                <input
                                    name="image"
                                    type="file"
                                    hidden
                                    onChange={onChange}
                                />
                            </Button>
                            {
                                image && (
                                    <Box component="div" sx={{ mt: 2, width: '100%', display: 'flex', flexGrow: 1, flexDirection: 'column', }}>
                                        <div style={{ flexGrow: 1, height: '10px' }}>
                                            <img src={image} alt="preview image"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    borderRadius: '10px',
                                                    objectFit: 'cover',
                                                    position: 'relative',
                                                }}
                                            />
                                        </div>

                                        <Stack spacing={2} direction="row" justifyContent="center" alignItems="center" style={{ flexGrow: 0, marginTop: '15px', marginBottom: '15px' }}>
                                            <RemoveCircleIcon onClick={() => onClickSign(-1)} sx={{ cursor: 'pointer' }} />
                                            <div>{mintNum}</div>
                                            <AddCircleRoundedIcon onClick={() => onClickSign(1)} sx={{ cursor: 'pointer' }} />
                                        </Stack>
                                        <Button onClick={onMint} color='secondary' variant="contained" style={{ flexGrow: 0 }}>Mint</Button>
                                    </Box>
                                )
                            }
                        </Box>
                    </Modal>
                    <Snackbar
                        open={alertState.open}
                        autoHideDuration={6000}
                        onClose={() => setAlertState({ ...alertState, open: false })}
                        anchorOrigin={{ vertical, horizontal }}
                    >
                        <Alert
                            onClose={() => setAlertState({ ...alertState, open: false })}
                            severity={alertState.severity}
                        >
                            {alertState.message}
                        </Alert>
                    </Snackbar>
                </div>
            </div>
            <div style={{ position: 'fixed', zIndex: 10000 }}>
                {
                    loading &&
                    <LoadingComponent color='#00ff00' type='spinningBubbles' />
                }
            </div>

        </div >
    )
}

export default Main
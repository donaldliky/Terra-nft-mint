import React from 'react'
import ReactLoading from 'react-loading';

const LoadingComponent = ({ type, color }) => {
    return (
        <div className='loading-body'>
            <ReactLoading type={type} color={color} height={'10%'} width={'10%'} />
        </div>
    )
}

export default LoadingComponent
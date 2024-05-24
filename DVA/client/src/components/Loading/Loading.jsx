import React from 'react'
import { InfinitySpin } from 'react-loader-spinner'
const Loading = () => {
  return (
    <div><InfinitySpin
    visible={true}
    width="200"
    color="#4fa94d"
    ariaLabel="infinity-spin-loading"
    /></div>
  )
}

export default Loading;
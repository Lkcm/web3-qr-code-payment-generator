import React from 'react'
import ConnectWalletButton from '../molecules/ConnectWalletButton'

const Header = () => {
  return (
    <div className="flex justify-end p-4 border border-b-blue-600/20">
  <ConnectWalletButton />
    </div>
  )
}

export default Header
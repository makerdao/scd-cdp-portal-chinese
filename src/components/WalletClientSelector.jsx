// Libraries
import React from "react";
import {inject, observer} from "mobx-react";
import walletIcons from './WalletIcons';

// Utils
import {getWebClientProviderName} from "../utils/blockchain";


@inject("network")
@observer
class WalletClientSelector extends React.Component {
  render() {
    const providerName = getWebClientProviderName();
    return (
      <div className="frame no-account">
        <div className="heading">
          <h2>连接到钱包</h2>
        </div>
        <section className="content">
          <div className="helper-text no-wrap">连接以下钱包开始</div>
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.setWeb3WebClient() } } className="web-wallet">
          {
            providerName ?
              <React.Fragment>
                <div className="provider-icon">{ walletIcons.hasOwnProperty(providerName) ? walletIcons[providerName] : walletIcons["web"] }</div>
                { this.props.formatClientName(providerName) }
              </React.Fragment>
            :
              <React.Fragment>
                <div className="provider-icon">{ walletIcons["web"] }</div>
                {this.props.network.isMobile ? "Mobile" : "Web"} 网页钱包
              </React.Fragment>
          }
          </a>
          {
          navigator.userAgent.toLowerCase().indexOf("firefox") === -1 &&
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW("ledger") } }>
            <div className="provider-icon">{ walletIcons["ledger"] }</div>
            Ledger Nano S
          </a>
          }
          <a href="#action" onClick={ e => { e.preventDefault(); this.props.network.showHW("trezor") } }>
            <div className="provider-icon">{ walletIcons["trezor"] }</div>
            Trezor
          </a>
        </section>
      </div>
    )
  }
}

export default WalletClientSelector;

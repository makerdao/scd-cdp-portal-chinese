// Libraries
import React from "react";
import {inject} from "mobx-react";

// Components
import LoadingSpinner from "./LoadingSpinner";

// Utils
import {getCurrentProviderName} from "../utils/blockchain";

@inject("network")
class NoAccount extends React.Component {
  render() {
    return (
      <div>
        <h2>登录到 { this.props.formatClientName(getCurrentProviderName()) }</h2>
        <p className="typo-c align-center">请解锁 { this.props.formatClientName(getCurrentProviderName()) } 账户以继续。</p>
        <LoadingSpinner />
        <div className="align-center" style={ {margin: "1rem 0"} }>
          <button className="sidebar-btn is-secondary" href="#action" onClick={ this.props.network.stopNetwork }>取消</button>
        </div>
      </div>
    )
  }
}

export default NoAccount;

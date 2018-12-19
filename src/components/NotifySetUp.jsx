// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Utils
import {etherscanTx} from "../utils/helpers";

// Images
import cdpCreated from "images/cdp-created.svg";
import cdpCreatedIcon1 from "images/cdp-created-icon-1.svg";
import cdpCreatedIcon2 from "images/cdp-created-icon-2.svg";
import cdpCreatedIcon3 from "images/cdp-created-icon-3.svg";

import cdpCreating1 from "images/cdp-creating-1.svg";
import cdpCreating2 from "images/cdp-creating-2.svg";
import cdpCreating3 from "images/cdp-creating-3.svg";
import cdpCreating4 from "images/cdp-creating-4.svg";
import cdpCreating5 from "images/cdp-creating-5.svg";
import cdpCreating6 from "images/cdp-creating-6.svg";

const cdpCreatingAnimation = [cdpCreating1, cdpCreating2, cdpCreating3, cdpCreating4, cdpCreating5, cdpCreating6];

class CreatingCDPAnimation extends React.Component {
  constructor(props){
    super(props);
    this.state = { currentCount: 1 }
  }
  timer() {
    this.setState({
      currentCount: this.state.currentCount === 6 ? 1 : this.state.currentCount + 1
    })
  }
  componentDidMount() {
    this.intervalId = setInterval(this.timer.bind(this), 2000);
  }
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }
  render() {
    return(
      <React.Fragment>
        <img className="main" src={ cdpCreatingAnimation[this.state.currentCount - 1] } alt="Creating CDP" />
      </React.Fragment>
    );
  }
}

@inject("transactions")
@inject("system")
@inject("network")
@observer
class NotifySetUp extends React.Component {
  render() {
    const txs = Object.keys(this.props.transactions.registry).filter(tx => this.props.transactions.registry[tx].cdpCreationTx);
    const txHash = txs[0] || null;

    return (
      this.props.transactions.showCreatingCdpModal &&
      <div className="modal create-cdp">
        <div className="modal-inner">
          {
            this.props.transactions.registry[txs[0]].pending || Object.keys(this.props.system.tub.cups).length === 0
            ?
              <React.Fragment>
                <h2>正在创建你的 CDP</h2>
                <CreatingCDPAnimation />
                <p style={ {margin: "margin: 0 auto", padding: "2rem 0 2.5rem"} }>
                {
                  txHash
                  ?
                    etherscanTx(this.props.network.network, "查看交易", txHash)
                  :
                    "创建你的新 CDP..."
                }
                </p>
              </React.Fragment>
            :
              <React.Fragment>
                <h2>恭喜，你的 CDP 已经创建成功！</h2>
                <img className="main" src={ cdpCreated } alt="CDP 已创建" />
                <p>
                  欢迎来到质押借 Dai 平台，你可以在去中心化环境下查看和管理你的<br />质押品.
                </p>
                <ul>
                  <li>
                    <div className="icon"><img src={ cdpCreatedIcon1 } alt="*" style={ {height: "24px"} } /></div>
                    查看当前债仓的<br />抵押品
                  </li>
                  <li>
                    <div className="icon"><img src={ cdpCreatedIcon2 } alt="*" style={ {height: "25px"} } /></div>
                    存入或者取回<br />质押品
                  </li>
                  <li>
                    <div className="icon"><img src={ cdpCreatedIcon3 } alt="*" style={ {height: "30px"} } /></div>
                    生成或者<br />偿还 DAI
                  </li>
                </ul>
                <div className="align-center" style={ {paddingBottom: "3.7rem", userSelect: "none"} }>
                  <button className="modal-btn is-primary" onClick={ () => this.props.transactions.cleanCdpCreationProperty(txs[0]) } style={ {width: "13rem"} }>完成</button>
                </div>
              </React.Fragment>
          }
      </div>
    </div>
    )
  }
}

export default NotifySetUp;

// Libraries
import React from "react";
import {Link} from "react-router-dom";
import DocumentTitle from "react-document-title";

// Components
import Menu from "./Menu";

class Help extends React.Component {
  render() {
    return (
      <DocumentTitle title="CDP Portal: Help">
        <div className="full-width-page">
          <div className="wrapper">
            {
              <Menu page="help" />
            }
            <main className="main-column fullwidth help-page">
              <div>
                <header className="col">
                  <h1 className="typo-h1">帮助</h1>
                </header>
                <div className="row">
                  <div className="col col-2 col-extra-padding">
                    <h2 className="typo-h2 ">常见问题</h2>
                    <h3 className="typo-h3 typo-white">主要问题</h3>
                    <ul className="typo-cl bullets">
                      <li><Link to="/help/what-is-a-collateralized-debt-position-cdp">什么是质押债仓?</Link></li>
                      <li><Link to="/help/what-is-the-best-way-to-lower-my-risk-of-liquidation">如何降低我的清算风险？</Link></li>
                      <li><Link to="/help/what-is-the-stability-fee">稳定费用是什么？</Link></li>
                      <li><Link to="/help/when-do-i-have-to-pay-the-stability-fee">何时需要支付稳定费用？</Link></li>
                      <li><Link to="/help/what-is-peth">PETH 是什么?</Link></li>
                      <li><Link to="/help/how-do-i-get-mkr-tokens">如何获得 MKR 代币？</Link></li>
                    </ul>
                  </div>
                  <div className="col col-2 col-extra-padding" style={ {paddingLeft: "2.5em"} }>
                    <h2 className="typo-h2">&nbsp;</h2>
                    <h3 className="typo-h3 typo-white">其他问题</h3>
                    <ul className="typo-cl bullets">
                      <li><Link to="/help/how-does-the-avatar-work">账户头像说明</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

export default Help;

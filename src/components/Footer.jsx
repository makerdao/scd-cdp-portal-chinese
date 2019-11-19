// Libraries
import React from "react";
import {Link} from "react-router-dom";

// Images
import makerLogoFooter from "images/maker-logo-footer.svg";

class Footer extends React.Component {
  render() {
    return (
      <React.Fragment>
        <div className="landing-footer">
          <div className="logo-block">
            <div className="line" />
            <div className="logo-center"><img src={ makerLogoFooter } alt="Maker" />Maker</div>
          </div>
          <p>
            Sai 信贷系统由 <a href="https://www.makerdao.com">Maker</a> 开发。<br />
            我们的团队包括全世界的开发者、经济学者以及设计师。我们的去中心化自治组织由代币持有者治理。
          </p>
          <ul>
            <li><Link to="/help">常见问题</Link></li>
            <li><a href="https://chat.makerdao.com">聊天室</a></li>
            <li><a href="https://weibo.com/makerdao">微博客服</a></li>
            <li><a href="https://cdp.tools/">CDP预警</a></li>
          </ul>
        </div>
      </React.Fragment>
    )
  }
}

export default Footer;

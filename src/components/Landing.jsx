// Libraries
import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { inject } from "mobx-react";

// Components
import WalletConnectMobile from "./WalletMobileConnect";
import McdAlert from "./McdAlert";
import OasisAlert from "./OasisAlert";

// Images
import welcomeHero from 'images/welcome-hero.svg';
import metamaskLogo from 'images/metamask-logo.svg';
import parityLogo from 'images/parity-logo.png';
import ledgerNanoLogo from 'images/ledger-nano-logo.png';
import trezorLogo from 'images/trezor-logo.png';
import { getStabilityFee } from "../utils/blockchain";

@inject("network")
class Landing extends React.Component {
  state = {
    stabilityFee: null
  }
  componentDidMount() {
    getStabilityFee().then(feeInHexa => {
      this.setState({ stabilityFee: feeInHexa.toFixed(2) });
    })
  }
  render() {
    function PrevButton(props) {
      const { className, style, onClick } = props;
      return (
        <svg className={className} style={{ ...style }} onClick={onClick} enableBackground="new 0 0 240.823 240.823" viewBox="0 0 240.823 240.823" xmlns="http://www.w3.org/2000/svg">
          <path d="m57.633 129.007 108.297 108.261c4.752 4.74 12.451 4.74 17.215 0 4.752-4.74 4.752-12.439 0-17.179l-99.707-99.671 99.695-99.671c4.752-4.74 4.752-12.439 0-17.191-4.752-4.74-12.463-4.74-17.215 0l-108.297 108.26c-4.679 4.691-4.679 12.511.012 17.191z" />
        </svg>
      );
    }
    function NextButton(props) {
      const { className, style, onClick } = props;
      return (
        <svg className={className} style={{ ...style }} onClick={onClick} enableBackground="new 0 0 240.823 240.823" viewBox="0 0 240.823 240.823" xmlns="http://www.w3.org/2000/svg">
          <path d="m183.189 111.816-108.297-108.261c-4.752-4.74-12.451-4.74-17.215 0-4.752 4.74-4.752 12.439 0 17.179l99.707 99.671-99.695 99.671c-4.752 4.74-4.752 12.439 0 17.191 4.752 4.74 12.463 4.74 17.215 0l108.297-108.261c4.68-4.691 4.68-12.511-.012-17.19z" />
        </svg>
      );
    }
    const settings = {
      dots: true,
      infinite: false,
      speed: 500,
      prevArrow: <PrevButton />,
      nextArrow: <NextButton />,
    };
    return (
      <div className="landing">

        <div className="landing-body">
          <McdAlert />
          <h1>欢迎来到<br />质押借 Sai 平台</h1>
          {
            this.props.network.isMobileWeb3Wallet && <WalletConnectMobile />
          }
          <Slider {...settings} className="landing-slider">
            <div className="first-slide">
              <div style={{ textAlign: "center" }}>
                <p className="align-center">
                  你可以在这里生成 Sai <br />
                  该应用由 Maker 团队开发管理<br />
                  存入质押品，生成 Sai
                </p>
                <img className="preview" src={welcomeHero} alt="CDP Portal" />
              </div>
            </div>
            <div>
              <div className="info-slide">
                <h1>01.<span className="line"></span>概念</h1>
                <h2 className="sm">什么是质押债仓（CDP）?</h2>
                <p>你可以通过质押债仓(CDP) 存入质押品 (目前支持 ETH)，借 Sai。之后偿还 Sai，取回质押品。</p>
              </div>
            </div>
            <div>
              <div className="info-slide">
                <h1>02.<span className="line"></span>好处</h1>
                <h2>使用质押债仓对我有什么好处?</h2>
                <p>你可以在不放弃质押品收益权的同时，获得 Sai 作为流动资金 (只要有足够的抵押品支撑生成的 Sai)。当使用 ETH 作为抵押品时，抵押品的价值需要保持在生成 Sai 数量的1.5倍。</p>
              </div>
            </div>
            <div>
              <div className="info-slide">
                <h1>03.<span className="line"></span>开始</h1>
                <h2>如何开始?</h2>
                <p><i>（网页端点击右上角连接钱包，手机端下滑后点击连接）</i> <br />你可以选择要存入 CDP 内的 ETH 数量，然后生成对应的稳定币 Sai，便可以任意使用。当你不需要流动性后，可以随时偿还 Sai 和稳定费用，取回存入的抵押品。</p>
              </div>
            </div>
            <div>
              <div className="info-slide">
                <h1>04.<span className="line"></span>风险</h1>
                <h2>生成 CDP 有风险吗?</h2>
                <p> 只要保持你的 CDP 中，ETH 的价值高于 SAI 的150%，CDP就不会被清算。如果质押率接近 150%，你可以追加质押品，或者偿还部分 Sai。如果质押品的价值下降到 150% 以下，CDP 会被清算。这意味着，系统会出售你的质押品，向市场回购你生成出的 Sai 数量。剩余的质押品会返回你的 CDP 中供你取回。有关风险，请查看 <Link to="/terms">服务条款</Link>。</p>
              </div>
            </div>
            <div>
              <div className="info-slide">
                <h1>05.<span className="line"></span>成本</h1>
                <h2>使用中会有费用吗？</h2>
                <p>{this.state.stabilityFee ? `生成稳定币 Sai 会有${this.state.stabilityFee}%的年化费用，你可以用 MKR 或者 SAI 支付费用。` : ''}如果你的 CDP 被清算，你的质押品会被扣除13%的罚金。</p>
              </div>
            </div>
          </Slider>

          <div className="getting-started">
            <h1>我该如何开始？</h1>
            <p> 授权以下的四个钱包之一，自动连接到CDP平台。了解这些钱包的更多信息，点击下方的链接。如果你是高级用户，也可以使用 MakerDAO 的命令符面板使用CDP。</p>
            <p className="align-center"><Link to="/help" className="faq">关于钱包的常见问题</Link></p>
            <ul>
              <li><a href="https://metamask.io/"><img src={metamaskLogo} alt="Get MetaMask" /><div>获得 MetaMask</div></a></li>
              <li><a href="https://www.parity.io/"><img src={parityLogo} alt="Get Parity" /><div>获得 Parity</div></a></li>
              <li><a href="https://www.ledgerwallet.com/products/ledger-nano-s"><img src={ledgerNanoLogo} alt="Get Ledger Nano S" /><div>获得 Ledger Nano S</div></a></li>
              <li><a href="https://trezor.io/"><img src={trezorLogo} alt="Get Trezor" /><div>获得 Trezor</div></a></li>
            </ul>
          </div>
        </div>

      </div>
    );
  }
}

export default Landing;

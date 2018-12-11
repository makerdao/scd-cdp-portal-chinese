// Libraries
import React from "react";
import {intercept} from "mobx";
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";
import ReactGA from 'react-ga';

// Components
import InlineNotification from "./InlineNotification";
import TooltipHint from "./TooltipHint";

// Utils
import {BIGGESTUINT256, WAD, wmul, wdiv, formatNumber, toBigNumber, fromWei, toWei, min, printNumber, isAddress} from "../utils/helpers";
import * as blockchain from "../utils/blockchain";

class DialogContent extends React.Component {
  render() {
    return (
      <div id="dialog" className="dialog bright-style">
        <button id="dialog-close-caller" className="close-box" onClick={ this.props.dialog.handleCloseDialog }></button>
        <div className="dialog-content">
          <h2 className="typo-h1">{ this.props.title }</h2>
          { this.props.indentedText && <p className="indented-text" dangerouslySetInnerHTML={ {__html: this.props.indentedText} }></p> }
          { this.props.text && <p className="main-text" dangerouslySetInnerHTML={ {__html: this.props.text} }></p> }
          { this.props.form ? this.props.form : "" }
        </div>
      </div>
    )
  }
}

@inject("profile")
@inject("system")
@inject("dialog")
@observer
class Dialog extends React.Component {
  constructor() {
    super();
    this.state = {
      submitEnabled: false,
      skr: null,
      liqPrice: toBigNumber(0),
      ratio: toBigNumber(0),
      govFeeType: "mkr",
      ownThisWallet: false,
      giveHasProxy: false,
      giveToProxy: true
    }
  }

  componentDidUpdate = () => {
    TooltipHint.rebuildTooltips();
  }

  componentDidMount = () => {
    intercept(this.props.dialog, "show", change => {
      if (change.newValue) {
        if (this.updateVal) {
          this.updateVal.value = "";
          this.updateVal.focus();
        }
        this.props.dialog.error = this.props.dialog.warning = "";
        this.setState({
          submitEnabled: false,
          skr: null,
          liqPrice: toBigNumber(0),
          ratio: toBigNumber(0),
          govFeeType: "mkr",
          ownThisWallet: false,
          giveHasProxy: false,
          giveToProxy: true
        });
        if (this.props.dialog.method === "wipe" && this.props.system.dai.myBalance.gt(0) && !this.props.system.gov.myBalance.gt(0)) {
          console.debug('Reporting 0 MKR balance on pay back DAI dialog');
          ReactGA.event({
            category: 'UX',
            action: 'Zero MKR balance on pay back DAI dialog'
          });
        }
      }
      return change;
    });
  }

  submitForm = e => {
    e.preventDefault();
    if (this.props.dialog.method === "shut" || this.props.dialog.method === "migrate" || this.state.submitEnabled) {
      const value = this.updateVal && typeof this.updateVal.value !== "undefined"
                    ?
                      this.props.dialog.method !== "give"
                      ?
                        toBigNumber(this.updateVal.value)
                      :
                        this.updateVal.value
                    :
                      false;
      const params = { value };
      if (this.props.dialog.method === "give") {
        params.giveHasProxy = this.state.giveHasProxy;
        params.giveToProxy = this.state.giveToProxy;
      }
      if (["wipe", "shut"].indexOf(this.props.dialog.method) !== -1) {
        params.govFeeType = this.state.govFeeType;
      }
      this.props.system.executeAction(params);
    }
  }

  selectGovFeeType = e => {
    this.setState({govFeeType: e.target.value}, () => {
      this.props.dialog.error = this.props.dialog.warning = "";
      if (this.updateVal !== "undefined" && this.updateVal && typeof this.updateVal.value !== "undefined") {
        this.cond(this.updateVal.value);
      }
    });
  }

  selectGiveToProxy = e => {
    this.setState({giveToProxy: e.target.checked});
  }

  selectOwnThisWallet = e => {
    this.setState({ownThisWallet: e.target.checked});
  }

  setMax = e => {
    e.preventDefault();
    let value = toBigNumber(0);
    switch(this.props.dialog.method) {
      case "wipe":
        value = min(this.props.system.dai.myBalance, this.props.system.tab(this.props.system.tub.cups[this.props.dialog.cupId]));
        break;
      // case "join":
      //   value = wdiv(this.props.system.gem.myBalance, wmul(this.props.system.tub.per, this.props.system.tub.gap));
      //   break;
      // case "exit":
      // case "lock":
      //   value = this.props.system.eth.myBalance;
      //   break;
      // case "free":
      //  value = this.props.system.tub.cups[this.props.dialog.cupId].avail_skr_with_margin;
      //  value = wmul(this.props.system.tub.cups[this.props.dialog.cupId].avail_skr, this.props.system.tub.per).round(0);
      //  break;
      // case "draw":
      //   value = this.props.system.tub.cups[this.props.dialog.cupId].avail_dai_with_margin;
      //   break;
      // case "boom":
      //   value = this.props.system.tub.avail_boom_skr.floor();
      //   break;
      // case "bust":
      //   value = this.props.system.tub.avail_bust_skr.floor();
      //   break;
      // case "cash":
      //   value = this.props.system.dai.myBalance;
      //   break;
      // case "mock":
      //   value = wdiv(this.props.system.gem.myBalance, this.props.system.tap.fix);
      //   break;
      default:
        break;
    }
    document.getElementById("inputValue").value = fromWei(value).valueOf();
    this.cond(document.getElementById("inputValue").value);
  }

  renderErrors = () => {
    return (
      <React.Fragment>
      { this.props.dialog.error && <InlineNotification type="error" message={ this.props.dialog.error } /> }
      { this.props.dialog.warning && <InlineNotification type="warning" message={ this.props.dialog.warning } /> }
      </React.Fragment>
    )
  }

  renderDetails = () => {
    return (
      <React.Fragment>
        <div className="info-heading">当前价格 (ETH/USD)</div>
        <div className="info-value">{ printNumber(this.props.system.pip.val, 2) } USD</div>
        <div className="info-heading">预计清算价格 (ETH/USD)</div>
        <div className="info-value">{ this.state.liqPrice.gt(0) ? printNumber(this.state.liqPrice, 2) : "--" } USD</div>
        <div className="info-heading">预计质押率</div>
        <div className={ "info-value" + (this.state.ratio.gt(0) && this.state.ratio.toNumber() !== Infinity ? " text-green" : "") + (this.props.dialog.warning ? " text-yellow" : "") + (this.props.dialog.error ? " text-red" : "") }>{ this.state.ratio.gt(0) && this.state.ratio.toNumber() !== Infinity ? printNumber(this.state.ratio.times(100), 2) : "--" } %</div>
      </React.Fragment>
    )
  }

  renderNumberInput = currencyUnit => {
    return (
      <React.Fragment>
        <input autoFocus ref={ input => this.updateVal = input } type="number" id="inputValue" className={ "number-input" + (this.props.dialog.warning ? " has-warning" : "") + (this.props.dialog.error ? " has-error" : "") } required step="0.000000000000000001" onChange={ e => { this.cond(e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 189) e.preventDefault() } } autoComplete="off" />
        { currencyUnit && <span className="unit">{ currencyUnit }</span> }
        <div className="clearfix"></div>
      </React.Fragment>
    )
  }

  renderFeeTypeSelector = () => {
    return (
      this.props.system.pep.val.gte(0) &&
      <React.Fragment>
        <div className="info-heading">年化稳定费用: { printNumber(toWei(fromWei(this.props.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100)), 1, true, true) }% <TooltipHint tipKey="stability-fee" /></div>
        <div className="info-value" style={ { marginBottom: "0"} }>{ printNumber(wdiv(this.props.system.futureRap(this.props.system.tub.cups[this.props.dialog.cupId], 1200), this.props.system.pep.val)) } MKR</div>
        <div className="info-value-smaller">你的 MKR 余额: { printNumber(this.props.system.gov.myBalance, 3) } MKR <Link to="/help/how-do-i-get-mkr-tokens" style={ {marginLeft: "5px"} }>获得 MKR</Link></div>
        {/* <div className="fee-type-selector">
          <input type="radio" id="govFeeMkr" name="govFeeMkr" value="mkr" checked={ this.state.govFeeType === "mkr" } onChange={ this.selectGovFeeType } /><label htmlFor="govFeeMkr">Pay stability fee with MKR</label><br />
          <input type="radio" id="govFeeDai" name="govFeeDai" value="dai" checked={ this.state.govFeeType === "dai" } onChange={ this.selectGovFeeType } /><label htmlFor="govFeeDai">Pay stability fee with DAI</label>
        </div> */}
      </React.Fragment>
    )
  }

  render() {
    const dialog = this.props.dialog;
    const cup = dialog.cupId ? this.props.system.tub.cups[dialog.cupId] : null;

    switch(dialog.method) {
      case "migrate":
        this.cond = () => { return false };
        return (
          <DialogContent
            title={ `映射 CDP #${dialog.cupId}` }
            text={ `请确认你希望映射 CDP #${dialog.cupId} 到当前的 CDP 面板. 一旦映射完成，你的 CDP 无法通过旧面板互动。` }
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div style={ { marginTop: "4rem"} }>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>取消</button>
                  <button className="text-btn text-btn-primary" type="submit">映射</button>
                </div>
              </form>
            }
          />
        )

      case "give":
        this.cond = value => {
          this.setState({
            submitEnabled: false,
            giveHasProxy: false
          }, () => {
            this.props.dialog.error = "";
            if (isAddress(value)) {
              console.debug(`检查代理所有权 ${value}...`);
              blockchain.getProxy(value).then(proxyAddress => {
                if (proxyAddress) {
                  console.debug(`检测到代理: ${proxyAddress}`);
                  this.setState({ giveHasProxy: true, submitEnabled: true });
                } else {
                  console.debug(`No proxy found`);
                  this.setState({ giveHasProxy: false, submitEnabled: true });
                }
              });
            } else {
              this.props.dialog.error = "无效的地址";
            }
          });
        };
        return (
          <DialogContent
            title={ `转移 CDP #${dialog.cupId}` }
            text="输入你希望转移到的以太坊地址"
            indentedText="你最好将 CDP 转移到自己所拥有的地址。勾选下面的选项，表示同意你拥有并控制当前 CDP 和将要转移到的以太坊地址。"
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  <input autoFocus ref={ input => this.updateVal = input } type="text" id="inputValue" className={ "address-input" + (this.props.dialog.warning ? " has-warning" : "") + (this.props.dialog.error ? " has-error" : "") } required onChange={ e => { this.cond(e.target.value) } } onKeyDown={ e => { if (e.keyCode === 38 || e.keyCode === 40) e.preventDefault() } } maxLength="42" placeholder="0x01234..." autoComplete="off" />
                  <div className="clearfix"></div>
                </div>
                <div style={ {marginTop: "0.75rem"} }>
                  <label className="checkbox-container">
                    <input type="checkbox" style={ {visibility: "initial", width: "0px"} } id="ownThisWallet" name="ownThisWallet" checked={ this.state.ownThisWallet } value="1" onChange={ this.selectOwnThisWallet } />
                    <span className="checkmark"></span>
                    我确认拥有这个以太坊地址，并且同意免责协议
                  </label>
                </div>
                {
                  this.state.giveHasProxy &&
                  <div style={ {marginTop: "0.75rem"} }>
                    <label className="checkbox-container">
                      <input type="checkbox" style={ {visibility: "initial", width: "0px"} } id="giveToProxy" name="giveToProxy" checked={ this.state.giveToProxy } value="1" onChange={ this.selectGiveToProxy } />
                      <span className="checkmark"></span>
                      将 CDP 转移到以太坊代理合约地址 <TooltipHint tip="这个地址会通过一个代理协议，点击确认将授权通过这个代理转移 CDP。" />
                    </label>
                  </div>
                }
                <div className="info-section">
                  {/* <div className="transfer-cdp-id">CDP #{ dialog.cupId }</div>
                  <div className="info-heading">Dai generated</div>
                  <div className="info-value">{ printNumber(this.props.system.tab(cup), 3) } DAI</div>
                  <div className="info-heading">Liquidation price (ETH/USD)</div>
                  <div className="info-value">{ this.props.system.tub.off === false && cup.liq_price && cup.liq_price.gt(0) ? printNumber(cup.liq_price) : "--" } USD</div>
                  <div className="info-heading">Collateralization ratio</div>
                  <div className={ "info-value" + (cup.ratio.gt(0) && cup.ratio.toNumber() !== Infinity ? " text-green" : "") + (this.props.dialog.warning ? " text-yellow" : "") }>{ cup.ratio.gt(0) && cup.ratio.toNumber() !== Infinity ? printNumber(toWei(cup.ratio).times(100), 2) : "--" } %</div> */}
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>取消</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled || !this.state.ownThisWallet }>转移</button>
                </div>
              </form>
            }
          />
        )

      case "shut":
        this.cond = () => { return false };
        return (
          <DialogContent
            title={ `关闭 CDP #${dialog.cupId}` }
            text="关闭 CDP 需要偿还你借出的 Dai 以及累计的稳定费用。稳定费用需要用 MKR 支付"
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="info-section">
                  <div className="info-heading">已生成的 Dai 款</div>
                  <div className="info-value">{ printNumber(this.props.system.tab(cup), 3) } DAI</div>
                  { cup && cup.art.gt(0) && this.renderFeeTypeSelector() }
                  {/* <div className="info-heading">Total Closing Payment</div>
                  <div className="info-value">{ printNumber(this.props.system.tab(cup), 3) } + 0.00 MKR</div> */}
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>取消</button>
                  <button className="text-btn text-btn-primary" type="submit">关闭</button>
                </div>
              </form>
            }
          />
        )

      case "lock":
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          const skrValue = wdiv(valueWei, this.props.system.tub.per).round(0);
          this.setState({
            submitEnabled: false,
            skr: skrValue,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink.add(skrValue), this.props.system.tab(cup)),
            ratio: this.props.system.calculateRatio(cup.ink.add(skrValue), this.props.system.tab(cup))
          }, () => {
            this.props.dialog.error = "";
            if (valueWei.gt(0)) {
              if (this.props.system.eth.myBalance.lt(valueWei)) {
                this.props.dialog.error = "没有足够的 ETH 余额.";
              } else if (cup.avail_skr.round(0).add(skrValue).gt(0) && cup.avail_skr.add(skrValue).round(0).lte(toWei(0.005))) {
                this.props.dialog.error = `存入的 ETH 数量太少，最低值为 0.005 PETH。 (${formatNumber(wmul(toBigNumber(toWei(0.005)), this.props.system.tub.per), 18)} ETH 以太实时价格).`;
              } else {
                this.setState({submitEnabled: true});
              }
            }
          });
        }
        return (
          <DialogContent
            title="存入质押品"
            text="你希望存入多少 ETH？"
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderNumberInput("ETH") }
                  <div className="peth-equiv">{ printNumber(this.state.skr) } PETH <TooltipHint tipKey="what-is-peth" /></div>
                </div>
                <div className="info-section">
                  <div className="info-heading">Current account balance</div>
                  <div className="info-value">{ printNumber(this.props.system.eth.myBalance, 2) } ETH</div>
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>取消</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>存入</button>
                </div>
              </form>
            }
          />
        )

      case "free":
        // if (this.props.system.tub.off) {
        //   // Need to add support for this
        //   // "Are you sure you want to withdraw your available ETH?"
        //   this.setState({submitEnabled: false});
        // } else {
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          const skrValue = wdiv(valueWei, this.props.system.tub.per).round(0);
          this.setState({
            submitEnabled: false,
            skr: skrValue,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink.minus(skrValue), this.props.system.tab(cup)),
            ratio: this.props.system.calculateRatio(cup.ink.minus(skrValue), this.props.system.tab(cup))
          }, () => {
            this.props.dialog.error = this.props.dialog.warning = "";
            if (valueWei.gt(0)) {
              if (cup.avail_skr.lt(skrValue)) {
                this.props.dialog.error = "你希望取回的 ETH 数量超过了最高值。";
              } else if (cup.ink.minus(skrValue).lte(toWei(0.005)) && !cup.avail_skr.round(0).eq(skrValue)) {
                this.props.dialog.error = `CDP 最少需要价值 0.005 PETH 的余额。 (${formatNumber(wmul(toBigNumber(toWei(0.005)), this.props.system.tub.per), 18)} 实时 ETH 价格). 你需要保留更多或者全部取回。`;
              } else if (valueWei.gt(0) && this.props.system.tub.off === false && cup.art.gt(0) && this.state.ratio.lt(WAD.times(2))) {
                this.props.dialog.warning = "你希望提取的数量会让 CDP 太接近清算值。";
                this.setState({submitEnabled: true});
              } else {
                this.setState({submitEnabled: true});
              }
            }
          });
        }
        // }
        return (
          <DialogContent
            title="取回质押品"
            text="你希望取回多少 ETH？"
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderNumberInput("ETH") }
                  <div className="peth-equiv">{ printNumber(this.state.skr) } PETH <TooltipHint tipKey="what-is-peth" /></div>
                </div>
                <div className="info-section">
                  <div className="info-heading">最多可取回数量</div>
                  <div className="info-value">{ cup ? printNumber(cup.avail_eth, 3) : "--" } ETH</div>
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>取消</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>取回</button>
                </div>
              </form>
            }
          />
        )

      case "draw":
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          this.setState({
            submitEnabled: false,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink, this.props.system.tab(cup).add(valueWei)),
            ratio: this.props.system.calculateRatio(cup.ink, this.props.system.tab(cup).add(valueWei))
          }, () => {
            this.props.dialog.error = this.props.dialog.warning = "";
            if (valueWei.gt(0)) {
              if (this.props.system.sin.totalSupply.add(valueWei).gt(this.props.system.tub.cap)) {
                this.props.dialog.error = "这个数量超过了系统的债务上限。";
              } else if (cup.avail_dai.lt(valueWei)) {
                this.props.dialog.error = "你没有足够的抵押品去生成这个数量的 DAI，请先存入更多的抵押品。";
              } else if (this.state.ratio.lt(WAD.times(2))) {
                this.props.dialog.warning = "提醒：你希望生成 DAI 的数量会让 CDP 比较接近清算值。";
                this.setState({submitEnabled: true});
              } else {
                this.setState({submitEnabled: true});
              }
            }
          });
        }
        return (
          <DialogContent
            title="生成 DAI"
            text="你希望生成多少 DAI？"
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderNumberInput("DAI") }
                </div>
                <div className="info-section">
                  <div className="info-heading">最多可生成数量</div>
                  <div className="info-value">{ printNumber(this.props.system.tub.cups[this.props.dialog.cupId].avail_dai, 2) } DAI</div>
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>取消</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>生成</button>
                </div>
              </form>
            }
          />
        )

      case "wipe":
        this.cond = value => {
          const valueWei = toBigNumber(toWei(value));
          this.setState({
            submitEnabled: false,
            liqPrice: this.props.system.calculateLiquidationPrice(cup.ink, this.props.system.tab(cup).minus(valueWei)),
            ratio: this.props.system.calculateRatio(cup.ink, this.props.system.tab(cup).minus(valueWei))
          }, () => {
            this.props.dialog.error = this.props.dialog.warning = "";
            if (valueWei.gt(0)) {
              const futureGovDebtSai =  wmul(
                                          valueWei,
                                          wdiv(
                                            this.props.system.futureRap(this.props.system.tub.cups[dialog.cupId], 1200),
                                            this.props.system.tab(this.props.system.tub.cups[dialog.cupId])
                                          )
                                        ).round(0);
              const futureGovDebtMKR =  wdiv(
                                          futureGovDebtSai,
                                          this.props.system.pep.val
                                        ).round(0);
              const valuePlusGovFee = this.state.govFeeType === "dai" ? valueWei.add(futureGovDebtSai.times(1.25)) : valueWei; // If fee is paid in DAI we add an extra 25% (spread)
              if (this.props.system.dai.myBalance.lt(valuePlusGovFee)) {
                this.props.dialog.error = "你没有足够的 DAI。";
              } else if (this.props.system.tab(cup).lt(valueWei)) {
                this.props.dialog.error = "你希望偿还 DAI 的数量超过了欠的 DAI 款";
              } else if (this.state.govFeeType === "mkr" && futureGovDebtMKR.gt(this.props.system.gov.myBalance)) {
                this.props.dialog.error = "你没有足够的 MKR 去偿还债务.";
              } else if (this.state.ratio.lt(WAD.times(1.5))) {
                this.props.dialog.warning = "你的 CDP 不足最低要求质押率，你应该偿还 DAI 或者追加更多的质押品。";
                this.setState({submitEnabled: true});
              } else if (this.state.ratio.lt(WAD.times(2))) {
                this.props.dialog.warning = "提醒：即使偿还这么多的 DAI，你的 CDP 还是比较接近清算线。";
                this.setState({submitEnabled: true});
              } else {
                this.setState({submitEnabled: true});
              }
            }
          });
        }
        const indentedText = (!this.props.system.dai.allowance.eq(BIGGESTUINT256) || !this.props.system.gov.allowance.eq(BIGGESTUINT256))
          ? "你也许需要去签名三个交易，如果许可的 DAI 和 MKR 不够。"
          : "";
        return (
          <DialogContent
            title="偿还 DAI"
            text="你希望偿还多少 DAI？"
            indentedText={ indentedText }
            dialog={ this.props.dialog }
            form={
              <form ref={ input => this.updateValueForm = input } onSubmit={ this.submitForm }>
                <div className="input-section">
                  { this.renderNumberInput("DAI") }
                  <div className="set-max"><a href="#action" onClick={ this.setMax }>全部偿还</a></div>
                </div>
                <div className="info-section" style={ { marginTop: "2rem"} }>
                  <div className="info-heading">已生成的 DAI 款</div>
                  <div className="info-value">{ printNumber(this.props.system.tab(this.props.system.tub.cups[this.props.dialog.cupId])) } DAI</div>
                  { this.renderFeeTypeSelector() }
                  { this.renderDetails() }
                  { this.renderErrors() }
                </div>
                <div>
                  <button className="text-btn" type="submit" onClick={ this.props.dialog.handleCloseDialog }>取消</button>
                  <button className="text-btn text-btn-primary" type="submit" disabled={ !this.state.submitEnabled }>偿还</button>
                </div>
              </form>
            }
          />
        )

      default:
        return <DialogContent dialog={ this.props.dialog } />
    }
  }
}

export default Dialog;

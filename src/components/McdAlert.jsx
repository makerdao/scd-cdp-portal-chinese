// Libraries
import React from "react";
import { observer } from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

@observer
class McdAlert extends React.Component {
  constructor(props){
    super(props);
    this.state = { show: true }
  }

  render() {
    return (
      this.state.show && !localStorage.getItem('McdAlertClosed') &&
      <InlineNotification
        class="mcd-alert"
        caption="多抵押 Dai 和 Oasis"
        message="多抵押 Dai 已于 2019 年 11 月 18 日上线，你可以在 Oasis.app 开启金库抵押多种资产借 Dai，存 Dai 生息并且进行交易。当前面板只能生成单抵押 Sai。"
        buttonText="前往 Oasis"
        onCloseButtonClick={ () => { localStorage.setItem('McdAlertClosed', true); this.setState({show: false}); } }
        onButtonClick={ () => window.open("https://oasis.app", "_blank") }
      />
    )
  }
}

export default McdAlert;

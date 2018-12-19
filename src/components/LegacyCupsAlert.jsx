// Libraries
import React from "react";
import {inject, observer} from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

@inject("network")
@inject("system")
@observer
class LegacyCupsAlert extends React.Component {
  constructor(props){
    super(props);
    this.state = { show: true }
  }

  render() {
    return (
      this.props.system.showLegacyAlert && this.state.show && !localStorage.getItem(`LegacyCDPsAlertClosed-${this.props.network.defaultAccount}`) &&
      <InlineNotification
        class="migrate-cups"
        caption="映射已有 CDPs"
        message="你的账户在旧的面板上有多个 CDPs，你需要将旧的 CDP 映射到新的 CDP 平台。在映射后，你的 CDP 只能通过新 CDP 面板互动。"
        buttonText="继续"
        onCloseButtonClick={ () => { localStorage.setItem(`LegacyCDPsAlertClosed-${this.props.network.defaultAccount}`, true); this.setState({show: false}); } }
        onButtonClick={ () => this.props.setOpenMigrate(true) }
      />
    )
  }
}

export default LegacyCupsAlert;

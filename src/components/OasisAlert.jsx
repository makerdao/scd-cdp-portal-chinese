// Libraries
import React from "react";
import { observer } from "mobx-react";

// Components
import InlineNotification from "./InlineNotification";

@observer
class OasisAlert extends React.Component {
  constructor(props){
    super(props);
    this.state = { show: true }
  }

  render() {
    return (
      this.state.show &&
      <InlineNotification
        class="mcd-alert"
        caption="多抵押 Dai 和 Oasis"
        buttonText="前往 Oasis.app"
        onCloseButtonClick={ () => { localStorage.setItem('OasisAppClosed', true); this.setState({show: false}); } }
        onButtonClick={ () => window.open("https://oasis.app", "_blank") }
      >
        新版本的多抵押 Dai 系统已经上线，现在你可以通过 oasis.app 开启「金库」。了解更多信息，请访问我们的论坛 forum.makerdao.com 或者聊天室 chat.makerdao.com。
      </InlineNotification>
    )
  }
}

export default OasisAlert;

// Libraries
import React from "react";

// Components
import LegacyCupsAlert from "./LegacyCupsAlert";

// Images
import welcomeSatellite from "images/welcome-satellite.svg";

class Welcome extends React.Component {
  render() {
    return (
      <div>
        <LegacyCupsAlert setOpenMigrate={ this.props.setOpenMigrate } />
        <header className="col">
          <h1 className="typo-h1 inline-headline">借 Dai 平台</h1>
        </header>
        <div className="row" style={ {borderBottom: "0"} }>
          <div className="align-center typo-cxl" style={ {margin: "3rem 0"} }>
            你还没有已经创建的CDP
          </div>
          <div className="align-center" style={ {margin: "3rem 0"} }>
            <button className="sidebar-btn is-primary-green" onClick={ e => { e.preventDefault(); this.props.setOpenCDPWizard() } }>创建 CDP</button>
          </div>
          <div className="align-center">
            <img src={ welcomeSatellite } alt="Welcome" style={ {width: "690px", height: "auto", maxWidth: "70%" } } />
          </div>
        </div>
      </div>
    )
  }
}

export default Welcome;

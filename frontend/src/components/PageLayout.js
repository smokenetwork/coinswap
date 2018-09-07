import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export const OldSchoolMenuLink = ({ label, to, activeOnlyWhenExact }) => {
    return (
        <Route path={to} exact={activeOnlyWhenExact} children={({ match }) => (
            <li className={match ? 'nav-item bg-light' : 'nav-item'}>
                {(() => {
                    if (match) {
                        return (<Link className="nav-link disabled" to="###" style={{pointerEvents: "none"}}>{label}</Link>);
                    } else {
                        return (<Link className="nav-link" to={to}>{label}</Link>);
                    }
                })()}
            </li>
        )}/>
    )
};

export class PageLayout extends Component {
    render() {
        let { message } = this.props;

        let renderMessage = null;
        if (message) {
            let {display, type, content} = message;
            if (display) {
                renderMessage = <div className={"alert alert-" + type}><span><b>Message: </b> {content}</span></div>;
            }
        }

        return(
            <div className="main">
                <div className="page-header page-header-xxs settings-background" style={{backgroundImage: "url('/assets/img/bg.jpg')"}}>
                    <div className="filter-info"></div>
                    <div className="content-center pb-5">
                        <div className="motto text-info shadow5">
                            <h2 className="font-weight-bold title-uppercase text-center">
                                {/*<i className="fa fa-user-secret mr-4" aria-hidden="true"></i>*/}
                                WLS.SHAREDROP</h2>
                            <h6 className="font-weight-bold text-center">for BTS/WHALESHARE/BROWNIE.PTS holders</h6>
                        </div>
                    </div>
                </div>

                <div className="section section-gray">
                    <div className="container">

                        <div className="row">

                            {/*<div className="col-md-3 col-sm-4 mb-3">*/}
                                {/*<ul className="nav flex-column">*/}
                                    {/*<OldSchoolMenuLink activeOnlyWhenExact={true} to="/sharedroptools" label="Sharedrop Tools" />*/}
                                    {/*<OldSchoolMenuLink activeOnlyWhenExact={true} to="/faq" label="Faq" />*/}
                                {/*</ul>*/}
                            {/*</div>*/}
                            <div className="col-md-12 col-sm-12 bg-light p-5">

                                {renderMessage}

                                {this.props.children}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

PageLayout.propTypes = {
    message: PropTypes.object
};

export default PageLayout;
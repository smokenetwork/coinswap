import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import { Action_CheckAccountName, Action_ShowMemo } from "../actions";

class CoinSwapTool extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: ""
        };
    };

    handleChange = (event) => {
        const target = event.target;
        const name = target.name;
        let value = target.type === 'checkbox' ? target.checked : target.value;

        if (name === "username") {
            value = value.toLowerCase();
        }

        this.setState({[name]: value});
    };

    render() {
        let username_bg = '';
        if (this.props.username_result === 'error') {
            username_bg = 'alert-warning';
        } else if (this.props.username_result === 'success') {
            username_bg = 'alert-success';
        }

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
                <div className="section section-gray">
                    <div className="container">

                        <div className="row">

                            <div className="col-md-12 col-sm-12 bg-light p-5">

                                {renderMessage}

                                <div className="form-group">
                                    <h6>Account Name <span className="icon-danger">*</span></h6>
                                    <p>The account name on Smoke chain to receive SMOKE</p>
                                    <br />

                                    <input disabled={this.props.loadingCheckUsername}
                                           name="username" type="text" maxLength="16"
                                           autoComplete="off"
                                           className={`form-control border-input ${username_bg}`}
                                           placeholder="Your new account name on Smoke chain"
                                           value={this.state.username}
                                           onChange={this.handleChange} />
                                    <br />
                                    <div className="text-center">
                                        {(() => {
                                            if (this.props.loadingCheckUsername) {
                                                return (<button disabled className="btn btn-sm btn-success btn-round">
                                                    <div className='uil-reload-css reload-small' style={{}}>
                                                        <div></div>
                                                    </div>
                                                </button>);
                                            } else {
                                                return (<button className="btn btn-sm btn-success btn-round" onClick={() => {
                                                    this.props.Action_CheckAccountName(this.state.username);
                                                }}>Check Available</button>);
                                            }
                                        })()}
                                    </div>
                                    <hr />
                                </div>

                                <div className="form-group">
                                    <h6>Memo</h6>
                                    <p>Use this memo text for swapping SMOKE.</p>
                                    <div className="text-center">
                                        <button className="btn btn-sm btn-success btn-round" onClick={() => { this.props.Action_ShowMemo(this.state.username); }}>Show me the memo</button>
                                    </div>
                                    <br />
                                    <textarea name="memo"
                                              className="form-control textarea-limited pre-line"
                                              placeholder="memo content for swapping SMOKE."
                                              style={{fontFamily: "monospace", whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}
                                              rows="5"
                                              value={this.props.memo}>
                                    </textarea>
                                    {/*<h5><small><span id="textarea-limited-message" className="pull-right">Copy Memo</span></small></h5>*/}

                                    <br />
                                    <p>Send <code>SMOKE</code> to <code>smoke-network</code> with this memo from your Bitshares account</p>
                                    <br />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state) => { return state.AppReducer; };
const mapDispatchToProps = { Action_CheckAccountName, Action_ShowMemo };
export default withRouter( connect( mapStateToProps, mapDispatchToProps)(CoinSwapTool) );
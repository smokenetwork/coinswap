import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import { Action_CheckAvailable_Name, Action_Generate_Keys, Action_ShowMemo } from "../actions";

class SharedropTools extends Component {
    constructor(props) {
        super(props);

        this.state = {
            toExitingAccount: false,
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

        //////////////
        // display private keys for user to save
        let private_keys_render = null;
        if (this.props.password) {
            private_keys_render = (
                <div>
                    <div className="alert alert-warning"><span><b>Warning!: </b> Please save these Private Keys into a safe place before going to next step!</span></div>
                    <p>Private <b>Owner</b> Key: <code>{this.props.private_keys.owner}</code></p>
                    <p>Private <b>Active</b> Key: <code>{this.props.private_keys.active}</code></p>
                    <p>Private <b>Posting</b> Key: <code>{this.props.private_keys.posting}</code></p>
                    <p>Private <b>Memo</b> Key: <code>{this.props.private_keys.memo}</code></p>
                </div>
            );
        }

        let required_fee = 1;

        return(
            <div className="main">
                <div className="section section-gray">
                    <div className="container">

                        <div className="row">

                            <div className="col-md-12 col-sm-12 bg-light p-5">

                                {renderMessage}

                                <div className="form-group">
                                    <h6>Account Name <span className="icon-danger">*</span></h6>

                                    <p>The account name on Smoke chain</p>

                                    <div className="form-check">
                                        <label className="form-check-label">
                                            <input name="toExitingAccount" className="form-check-input" type="checkbox" checked={this.state.toExitingAccount} onChange={this.handleChange} />
                                            <span className="form-check-sign"></span>
                                            Check the box to claim to an existing Whaleshares account <br />
                                            ( Leave the box uncheck to create a new Whaleshares account )
                                        </label>
                                    </div>
                                    <br />

                                    <input disabled={this.props.loadingCheckUsername} name="username" type="text" maxLength="16" className={`form-control border-input ${username_bg}`} placeholder="Your new account name on Smoke chain" value={this.state.username} onChange={this.handleChange} />
                                    <br />
                                    <div className="text-center">
                                        {(() => {
                                            if (this.props.loadingCheckUsername) {
                                                return (<button disabled className="btn btn-sm btn-facebook btn-round">
                                                    <div className='uil-reload-css reload-small' style={{}}>
                                                        <div></div>
                                                    </div>
                                                </button>);
                                            } else {
                                                return (<button className="btn btn-sm btn-facebook btn-round" onClick={() => {
                                                    this.props.Action_CheckAvailable_Name(this.state.username, this.state.toExitingAccount);
                                                }}>Check Available</button>);
                                            }
                                        })()}
                                    </div>
                                    <hr />
                                </div>

                                {
                                    !this.state.toExitingAccount &&
                                    <div className="form-group">
                                        <h6>Private Keys <span className="icon-danger">*</span></h6>
                                        <p>Your keys on Whaleshares chain.</p>
                                        <div className="text-center">
                                            <button className="btn btn-sm btn-facebook btn-round" onClick={() => { this.props.Action_Generate_Keys(this.state.username); }}>Generate Random Keys</button>
                                        </div>
                                        <br />
                                        {private_keys_render}
                                        <hr />
                                    </div>
                                }

                                <div className="form-group">
                                    <h6>Memo</h6>
                                    <p>Use this memo text for claiming WLS sharedrop.</p>
                                    <div className="text-center">
                                        <button className="btn btn-sm btn-facebook btn-round" onClick={() => { this.props.Action_ShowMemo(this.state.username, this.state.toExitingAccount); }}>Show me the memo</button>
                                    </div>
                                    <br />
                                    <textarea name="memo"
                                              className="form-control textarea-limited pre-line"
                                              placeholder="memo content for claiming WLS sharedrop."
                                              style={{fontFamily: "monospace", whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}
                                              rows="5"
                                              value={this.props.memo}>
                                    </textarea>
                                    {/*<h5><small><span id="textarea-limited-message" className="pull-right">Copy Memo</span></small></h5>*/}

                                    <br />
                                    <p>Send <code>{required_fee} WHALESHARE</code> to <code>wlsbts</code> with this memo from your Bitshares account</p>
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
const mapDispatchToProps = { Action_CheckAvailable_Name, Action_Generate_Keys, Action_ShowMemo };
export default withRouter( connect( mapStateToProps, mapDispatchToProps)(SharedropTools) );